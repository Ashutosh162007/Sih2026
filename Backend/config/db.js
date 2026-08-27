const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers (Google + Cloudflare) to prevent Windows / ISP SRV querySrv ECONNREFUSED errors with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if not supported in some restricted environments
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sahayog_db';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Sahayog Backend] MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[Sahayog Backend] MongoDB Connection Error: ${err.message}`);
    return null;
  }
};

module.exports = connectDB;
