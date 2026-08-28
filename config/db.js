// config/db.js
const mongoose = require('mongoose');

const collectionExists = async (collectionName) => {
  const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
  return collections.length > 0;
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB');
    try {
      if (await collectionExists('users')) {
        await mongoose.connection.db.collection('users').dropIndex('image_1');
        console.log("Index 'image_1' dropped successfully");
      }
    } catch (err) {
      if (err.codeName !== 'IndexNotFound') {
        console.log("Error dropping index from users:", err.message);
      }
    }
    
    try {
      if (await collectionExists('emails')) {
        await mongoose.connection.db.collection('emails').dropIndex('uid_1');
        console.log("Old index 'uid_1' from emails dropped successfully");
      }
    } catch (err) {
      if (err.codeName !== 'IndexNotFound') {
        console.log("Error dropping index from emails:", err.message);
      }
    }


   try {
      if (await collectionExists('schools')) {
        await mongoose.connection.collection("schools").dropIndex("students.rollNumber_1");
        await mongoose.connection.collection("schools").createIndex(
          { "students.rollNumber": 1 },
          { unique: true, sparse: true },
        );
        console.log("Index on students.rollNumber recreated with sparse:true");
      }
    } catch (err) {
      if (err.codeName !== 'IndexNotFound') {
        console.log("Error dropping/recreating index on students:", err.message);
      }
    }



  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
