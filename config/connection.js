require('dotenv').config(); // Load environment variables

const mongoose = require('mongoose');

// Optional: Check if MONGOURL is set
if (!process.env.MONGOURL) {
    console.error('MONGOURL environment variable is not set');
    process.exit(1);
}

mongoose.set('strictQuery', false);

const db = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGOURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB database connected");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = db;
