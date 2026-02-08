import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Models
import User from './src/models/user.model.js';
import Reel from './src/models/reel.model.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
    console.error('❌ MONGODB_URL not found in .env');
    process.exit(1);
}

// Data Sources
const USERS_DATA = [
    // Indian Users
    { name: "Aarav Sharma", gender: "men" },
    { name: "Priya Patel", gender: "women" },
    { name: "Vihaan Kumar", gender: "men" },
    { name: "Diya Gupta", gender: "women" },
    { name: "Arjun Singh", gender: "men" },
    { name: "Ananya Reddy", gender: "women" },
    { name: "Rohan Verma", gender: "men" },
    { name: "Ishita Rao", gender: "women" },
    { name: "Aditya Mishra", gender: "men" },
    { name: "Kavya Joshi", gender: "women" },
    // International Users
    { name: "Liam Johnson", gender: "men" },
    { name: "Emma Wilson", gender: "women" },
    { name: "Noah Brown", gender: "men" },
    { name: "Olivia Davis", gender: "women" },
    { name: "William Taylor", gender: "men" },
    { name: "Ava Martinez", gender: "women" },
    { name: "James Anderson", gender: "men" },
    { name: "Sophia Thomas", gender: "women" },
    { name: "Benjamin White", gender: "men" },
    { name: "Isabella Harris", gender: "women" },
];

const VIDEO_URLS = [
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4"
];

const COMMENTS_LIST = [
    "Amazing! 🔥", "Love this ❤️", "So cool!", "Wow 😍", "Great vibe",
    "This is incredible", "Keep it up!", "Beautiful capture", "Inspiring ✨",
    "Haha nice one 😂", "Superb!", "Can't wait for more", "Absolutely stunning",
    "Underrated content", "Trending soon 🚀", "Big fan!", "Awesome edit",
    "Where is this?", "Goals 🙌", "Perfection"
];

const generateRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URL);
        console.log('✅ Connected');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Reel.deleteMany({});
        console.log('✅ Data cleared');

        // Create Users
        console.log('👥 Creating users...');
        const hashedDefaultPassword = await bcrypt.hash('password123', 10);
        const users = [];

        for (let i = 0; i < USERS_DATA.length; i++) {
            const userData = USERS_DATA[i];
            const username = userData.name.toLowerCase().replace(/\s/g, '') + generateRandomInt(1, 999);

            const user = await User.create({
                name: userData.name,
                username: username,
                email: `${username}@example.com`,
                password: hashedDefaultPassword,
                bio: `Just a ${userData.name} living the dream ✨ | Lifestyle & Vibes`,
                avatarUrl: `https://randomuser.me/api/portraits/${userData.gender}/${i + 1}.jpg`,
                isVerified: Math.random() > 0.8, // 20% verification chance
            });
            users.push(user);
        }
        console.log(`✅ Created ${users.length} users`);

        // Create Reels
        console.log('📹 Creating reels...');
        const reels = [];

        for (const user of users) {
            // Create 2-3 reels per user
            const numReels = generateRandomInt(2, 3);

            for (let j = 0; j < numReels; j++) {
                const videoUrl = getRandomItem(VIDEO_URLS);

                const reel = await Reel.create({
                    title: `Vibes check #${generateRandomInt(1, 100)} ✨`,
                    description: `Enjoying the moment! #lifestyle #trending #viral #reels`,
                    videoUrl: videoUrl,
                    uploadedBy: String(user._id), // Schema requires String (based on inspected model)
                    user: user._id, // Also set the ref
                    shareCount: generateRandomInt(0, 50)
                });
                reels.push(reel);
            }
        }
        console.log(`✅ Created ${reels.length} reels`);

        // Simulate Interactions
        console.log('❤️ Simulating interactions...');

        for (const reel of reels) {
            // Add Likes (Random 5-15 users)
            const numLikes = generateRandomInt(5, 15);
            const likers = new Set();
            while (likers.size < numLikes) {
                likers.add(getRandomItem(users)._id);
            }
            reel.like = Array.from(likers).map(id => String(id));

            // Add Saves (Random 0-5 users)
            const numSaves = generateRandomInt(0, 5);
            const savers = new Set();
            while (savers.size < numSaves) {
                savers.add(getRandomItem(users)._id);
            }
            reel.saves = Array.from(savers).map(id => String(id));

            // Add Comments (Random 2-8 comments)
            const numComments = generateRandomInt(2, 8);
            for (let k = 0; k < numComments; k++) {
                const commenter = getRandomItem(users);
                reel.comments.push({
                    user: String(commenter._id), // Schema stores user ID string generally
                    text: getRandomItem(COMMENTS_LIST),
                    createdAt: new Date(Date.now() - generateRandomInt(0, 10000000))
                });
            }

            await reel.save();
        }
        console.log('✅ Interactions added');
        console.log('🚀 Seeding complete!');
        console.log('Use email: "liamjohnson123@example.com" (check console for exact emails) and password: "password123" to login.');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seed();
