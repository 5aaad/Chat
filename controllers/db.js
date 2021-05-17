const mongoose = require("mongoose");

const connectDB = async function () {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log(`MongoDB connected: ${conn.connection.host}`.blue.bold);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;