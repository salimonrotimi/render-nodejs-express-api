require('dotenv').config(); //OR require('dotenv/config')
const mongoose = require('mongoose');

const dbconnect = async() => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_URI_STRING, {
            dbName: process.env.DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connection successful');
    } catch (err) {
        console.error('Error connecting to MongoDB: ', err);
    }
}

module.exports = dbconnect;