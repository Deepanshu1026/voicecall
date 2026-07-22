require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('../src/models/Employee');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall');
    const hash = await bcrypt.hash('123456', 12);
    const result = await Employee.updateMany({}, { password: hash });
    console.log(`Updated ${result.modifiedCount} employees with password 123456`);
    const employees = await Employee.find().select('username email role');
    console.log('\nEmployees:');
    employees.forEach((e) => console.log(`  ${e.email || e.username || e._id}  (role: ${e.role}, username: ${e.username})`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
