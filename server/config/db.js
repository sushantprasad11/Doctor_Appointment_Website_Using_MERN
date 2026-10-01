const mongoose = require('mongoose');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
}

/**
 * Connect to MongoDB Atlas.
 * Returns a promise that resolves when connected.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set.');
  }

  try {
    await mongoose.connect(uri);
    console.log(' MongoDB connected successfully');
  } catch (error) {
    console.error(' MongoDB connection error:', error.message);
    throw error;
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('  MongoDB disconnected');
  });
}

module.exports = connectDB;
