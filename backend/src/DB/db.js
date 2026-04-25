import mongoose from 'mongoose';

async function connectDB() {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
        throw new Error('MONGODB_URL is not configured');
    }

    await mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected successfully");
}

export default connectDB;
