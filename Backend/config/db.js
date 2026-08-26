const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sahayog_db';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Sahayog Backend] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[Sahayog Backend] MongoDB Connection Warning: ${err.message}`);
    console.warn('[Sahayog Backend] Operating with in-memory fallback store if MongoDB is not running locally.');
    return null;
  }
};

module.exports = connectDB;
