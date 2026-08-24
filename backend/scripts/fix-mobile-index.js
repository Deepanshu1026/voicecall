// Run: node backend/scripts/fix-mobile-index.js
const mongoose = require('mongoose');
const config = require('../config');

(async () => {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.db.collection('users');

  // List all indexes
  const indexes = await collection.indexes();
  console.log('Existing indexes:', indexes.map((i) => ({ name: i.name, key: i.key, unique: i.unique, partialFilterExpression: i.partialFilterExpression })));

  // Find any unique index on mobile that is missing the partial filter
  for (const idx of indexes) {
    if (
      idx.unique &&
      idx.key &&
      Object.keys(idx.key).length === 1 &&
      idx.key.mobile !== undefined &&
      (!idx.partialFilterExpression || !idx.partialFilterExpression.mobile || !idx.partialFilterExpression.mobile['$type'])
    ) {
      console.log(`Dropping broken index: ${idx.name}`);
      await collection.dropIndex(idx.name);
      console.log('Dropped.');
    }
  }

  // Recreate the correct partial unique index
  try {
    await collection.createIndex(
      { mobile: 1 },
      { unique: true, partialFilterExpression: { mobile: { $type: 'string', $gt: '' } }, name: 'mobile_1_unique_partial' },
    );
    console.log('Created correct partial unique index on mobile.');
  } catch (e) {
    if (e.code === 85 || e.message.includes('already exists')) {
      console.log('Correct index already exists, nothing to do.');
    } else {
      throw e;
    }
  }

  // Verify
  const updated = await collection.indexes();
  console.log('Final indexes:', updated.map((i) => ({ name: i.name, key: i.key, unique: i.unique, partialFilterExpression: i.partialFilterExpression })));

  await mongoose.disconnect();
  console.log('Done.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
