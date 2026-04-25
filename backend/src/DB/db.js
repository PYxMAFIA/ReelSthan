import mongoose from 'mongoose';
import { getEnv } from '../config/env.js';

async function connectDB() {
    const mongoUrl = getEnv('MONGODB_URL', { required: true });

    await mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected successfully");
}

export default connectDB;
