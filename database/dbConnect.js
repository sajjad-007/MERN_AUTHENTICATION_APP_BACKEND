const mongoose = require('mongoose')

const mongodbConnection = async (req, res) => {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'AUTHENTICATION',
    });
    if (dbConnection) {
      console.log('Database connection Successfull');
    }
  } catch (error) {
    console.error('error from mongodb connection', error);
  }
};

module.exports = { mongodbConnection };