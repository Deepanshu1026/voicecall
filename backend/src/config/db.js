const mongoose = require('mongoose');
const config = require('./index');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }
    console.error('MongoDB connection failed after all retries. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;
