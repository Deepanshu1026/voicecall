require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const fs = require('fs');
const path = require('path');
const Application = require('../src/models/Application');
const Employee = require('../src/models/Employee');

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';
const SQL_PATH = path.resolve(__dirname, '..', '..', 'applications.sql');

function parseApplicationRows(sql) {
  const insertRegex = /INSERT\s+INTO\s+`applications`\s*\([^)]+\)\s*VALUES\s*((?:.|\n)+?);/gi;
  const result = [];

  let insertMatch;
  while ((insertMatch = insertRegex.exec(sql)) !== null) {
    let valuesStr = insertMatch[1];
    valuesStr = valuesStr.replace(/\s+/g, ' ');

    const rows = [];
    let depth = 0;
    let current = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < valuesStr.length; i++) {
      const ch = valuesStr[i];
      const prev = i > 0 ? valuesStr[i - 1] : '';

      if (inString) {
        current += ch;
        if (ch === stringChar && prev !== '\\') inString = false;
        continue;
      }

      if (ch === "'" || ch === '"') {
        inString = true;
        stringChar = ch;
        current += ch;
        continue;
      }

      if (ch === '(' && depth === 0) {
        depth = 1;
        current = '(';
        continue;
      }
      if (ch === '(') {
        depth++;
        current += ch;
        continue;
      }
      if (ch === ')') {
        depth--;
        current += ch;
        if (depth === 0) {
          rows.push(current);
          current = '';
        }
        continue;
      }
      if (depth > 0) current += ch;
    }

    for (const rowStr of rows) {
      const parts = [];
      let cur = '';
      let instr = false;
      let schar = '';
      for (let i = 1; i < rowStr.length - 1; i++) {
        const ch = rowStr[i];
        const prev = rowStr[i - 1];
        if (instr) {
          cur += ch;
          if (ch === schar && prev !== '\\') instr = false;
          continue;
        }
        if (ch === "'" || ch === '"') {
          instr = true;
          schar = ch;
          cur += ch;
          continue;
        }
        if (ch === ',') {
          parts.push(cur);
          cur = '';
          continue;
        }
        cur += ch;
      }
      if (cur) parts.push(cur);
      if (parts.length < 7) continue;

      // MySQL-style unescape: preserve `\\` by using a placeholder so that
      // `\\n` (literal \\n in value) is not misconverted to backslash + newline.
      const PLACEHOLDER = '\u0000';
      const un = (s) => {
        if (!s) return '';
        s = s.trim();
        if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
          s = s.slice(1, -1)
            .replace(/\\\\/g, PLACEHOLDER)
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\b/g, '\b')
            .replace(/\\0/g, '\0')
            .replace(new RegExp(PLACEHOLDER, 'g'), '\\');
        }
        return s;
      };

      const parseJson = (s) => {
        const raw = un(s);
        if (!raw) return {};
        try {
          return JSON.parse(raw);
        } catch (e) {
          console.warn('Failed to parse details JSON for id', parts[0], e.message);
          return { raw };
        }
      };

      result.push({
        id: parseInt(parts[0]) || 0,
        agent_id: parseInt(parts[1]) || 0,
        client_name: un(parts[2]),
        contact_number: un(parts[3]),
        details: parseJson(parts[4]),
        status: un(parts[5]) || 'pending',
        created_at: un(parts[6]) || null,
        updated_at: parts[7] ? un(parts[7]) : null,
      });
    }
  }
  return result;
}

async function main() {
  if (!fs.existsSync(SQL_PATH)) {
    console.error('SQL file not found:', SQL_PATH);
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(ATLAS_URI);
  console.log('Connected.');

  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  console.log('Parsing SQL file...');
  const rows = parseApplicationRows(sql);
  console.log(`Parsed ${rows.length} rows from SQL.`);

  const existing = await Application.find({}, { sqlId: 1 }).lean();
  const existingIds = new Set(existing.map((a) => a.sqlId));
  console.log(`Found ${existingIds.size} existing application records in MongoDB.`);

  const newRows = rows.filter((r) => !existingIds.has(r.id));
  console.log(`New rows to insert: ${newRows.length}`);

  if (newRows.length === 0) {
    console.log('Nothing to import. Exiting.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const employees = await Employee.find({}, { sqlId: 1 }).lean();
  const employeeIds = new Set(employees.map((e) => e.sqlId).filter(Boolean));
  const missingAgents = new Set();

  const documents = newRows.map((r) => {
    if (!employeeIds.has(r.agent_id)) {
      missingAgents.add(r.agent_id);
    }
    return {
      sqlId: r.id,
      agentId: r.agent_id,
      clientName: r.client_name,
      contactNumber: r.contact_number,
      details: r.details,
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at) : new Date(),
      updatedAt: r.updated_at ? new Date(r.updated_at) : new Date(),
    };
  });

  if (missingAgents.size > 0) {
    console.warn(`Warning: ${missingAgents.size} unique agent_id values not found in Employee collection:`, Array.from(missingAgents).slice(0, 20));
  }

  // Bulk insert in batches
  const BATCH_SIZE = 200;
  let inserted = 0;
  let failed = 0;
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    try {
      await Application.insertMany(batch, { ordered: false });
      inserted += batch.length;
      console.log(`Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} records)`);
    } catch (err) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, err.message);
      if (err.writeErrors) {
        inserted += batch.length - err.writeErrors.length;
        failed += err.writeErrors.length;
      } else {
        failed += batch.length;
      }
    }
  }

  const finalCount = await Application.countDocuments();
  console.log('\nImport complete.');
  console.log(`Rows parsed: ${rows.length}`);
  console.log(`Existing skipped: ${rows.length - newRows.length}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total applications in MongoDB now: ${finalCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
