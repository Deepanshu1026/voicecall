// Creates a JSON backup of all local MongoDB data
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall';
const BACKUP_DIR = path.resolve(__dirname, '..', 'backup');

(async () => {
  try {
    const conn = await mongoose.createConnection(LOCAL_URI).asPromise();
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const collections = await conn.db.listCollections().toArray();
    const names = collections.map((c) => c.name).filter((n) => !n.startsWith('system.'));

    for (const name of names) {
      const docs = await conn.db.collection(name).find({}).toArray();
      fs.writeFileSync(path.join(BACKUP_DIR, `${name}.json`), JSON.stringify(docs, null, 2));
      console.log(`  ${name}: ${docs.length} docs`);
    }

    console.log(`\nBackup saved to: ${BACKUP_DIR}`);
    await conn.close();
    process.exit(0);
  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  }
})();
