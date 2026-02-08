import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './src/models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const user = await User.findOne();
        if (user) {
            console.log('Valid Login Credential:');
            console.log('Email:', user.email);
            console.log('Password: password123'); // We know this from seed.js
        } else {
            console.log('No users found in database.');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

check();
