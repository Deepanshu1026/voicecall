require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const fs = require('fs');
const path = require('path');

// Use Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8']);

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';
const BACKUP_DIR = path.resolve(__dirname, '..', 'backup');

(async () => {
  try {
    const conn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('Connected to Atlas\n');

    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const name = file.replace('.json', '');
      const docs = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, file), 'utf8'));
      if (docs.length === 0) { console.log(`  ${name}: 0 docs, skipped`); continue; }
      await conn.db.collection(name).deleteMany({});
      await conn.db.collection(name).insertMany(docs, { ordered: false });
      console.log(`  ${name}: ${docs.length} docs restored`);
    }

    console.log('\nAll data pushed to Atlas!');
    await conn.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
})();
