require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('../src/models/Application');
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall');
    const distinct = await Application.distinct('agentId');
    console.log('Distinct agentIds:', distinct);
    const total = await Application.countDocuments();
    console.log('Total applications:', total);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
