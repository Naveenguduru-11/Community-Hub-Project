const mongoose = require('mongoose');

const connectDB = async () => {
  // Turn off Mongoose buffering to prevent 10000ms timeout hangs when DB is unreachable
  mongoose.set('bufferCommands', false);

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/communityhub';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n=============================================================`);
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    console.warn(`👉 Running backend in Resilient Demo Mode.`);
    console.warn(`👉 Registration, Login, Gate Passes, and Payments work instantly!`);
    console.warn(`👉 To connect real database, set MONGO_URI in backend/.env`);
    console.warn(`=============================================================\n`);
  }
};

module.exports = connectDB;
