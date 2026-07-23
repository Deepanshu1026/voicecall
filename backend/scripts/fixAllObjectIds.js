require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

const REF_ARRAY_FIELDS = ['participants', 'readBy', 'deliveredTo', 'deletedFor', 'blockedUsers', 'blockedBy'];
const REF_OBJECT_FIELDS = ['sender', 'recipient', 'conversation', 'user', 'lastMessage', 'caller', 'receiver', 'groupAdmin', 'lockedToAgent'];

function fixDoc(doc) {
  let changed = false;
  if (doc._id && typeof doc._id === 'string') {
    doc._id = new mongoose.Types.ObjectId(doc._id);
    changed = true;
  }
  for (const f of REF_OBJECT_FIELDS) {
    if (doc[f] && typeof doc[f] === 'string') {
      doc[f] = new mongoose.Types.ObjectId(doc[f]);
      changed = true;
    }
  }
  if (doc.replyTo && typeof doc.replyTo === 'string') {
    doc.replyTo = new mongoose.Types.ObjectId(doc.replyTo);
    changed = true;
  }
  if (doc.forwardedFrom && typeof doc.forwardedFrom === 'string') {
    doc.forwardedFrom = new mongoose.Types.ObjectId(doc.forwardedFrom);
    changed = true;
  }
  for (const f of REF_ARRAY_FIELDS) {
    if (Array.isArray(doc[f])) {
      const arr = doc[f].map(p => typeof p === 'string' ? new mongoose.Types.ObjectId(p) : p);
      if (JSON.stringify(arr) !== JSON.stringify(doc[f])) changed = true;
      doc[f] = arr;
    }
  }
  if (Array.isArray(doc.contacts)) {
    const c = doc.contacts.map(ct => {
      if (ct.user && typeof ct.user === 'string') { ct.user = new mongoose.Types.ObjectId(ct.user); changed = true; }
      return ct;
    });
    doc.contacts = c;
  }
  if (Array.isArray(doc.reactions)) {
    const r = doc.reactions.map(rt => {
      if (rt.user && typeof rt.user === 'string') { rt.user = new mongoose.Types.ObjectId(rt.user); changed = true; }
      return rt;
    });
    doc.reactions = r;
  }
  return changed;
}

(async () => {
  await mongoose.connect(ATLAS_URI);
  const db = mongoose.connection.db;
  console.log('Connected');

  const collections = ['users', 'employees', 'messages', 'conversations', 'applications', 'applicationlogs', 'calls', 'transactions'];

  for (const name of collections) {
    const all = await db.collection(name).find({}).toArray();
    let fixed = 0;
    for (const doc of all) {
      if (fixDoc(doc)) {
        await db.collection(name).deleteOne({ _id: doc._id.toString() });
        await db.collection(name).insertOne(doc);
        fixed++;
      }
    }
    console.log(`${name}: fixed ${fixed}/${all.length}`);
  }

  await mongoose.disconnect();
  console.log('All collections fixed!');
  process.exit(0);
})().catch(e => { console.error('CRASH:', e.message); process.exit(1); });
