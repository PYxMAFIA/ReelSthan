import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';
import Reel from './src/models/reel.model.js';

dotenv.config();

async function testDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB\n');
        
        const userCount = await User.countDocuments();
        const reelCount = await Reel.countDocuments();
        
        console.log('📊 Database Status:');
        console.log(`   👥 Users: ${userCount}`);
        console.log(`   🎬 Reels: ${reelCount}\n`);
        
        // Show sample reel
        const sampleReel = await Reel.findOne().populate('uploadedBy');
        if (sampleReel) {
            console.log('🎥 Sample Reel:');
            console.log(`   Title: ${sampleReel.title}`);
            console.log(`   Video URL: ${sampleReel.videoUrl}`);
            console.log(`   By: ${sampleReel.uploadedBy?.name || 'Unknown'}\n`);
        }
        
        // Show sample user
        const sampleUser = await User.findOne();
        if (sampleUser) {
            console.log('👤 Sample User:');
            console.log(`   Name: ${sampleUser.name}`);
            console.log(`   Email: ${sampleUser.email}`);
            console.log(`   Username: ${sampleUser.username}\n`);
        }
        
        console.log('✅ Database is properly seeded!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

testDB();
