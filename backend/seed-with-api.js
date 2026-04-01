import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Models
import User from './src/models/user.model.js';
import Reel from './src/models/reel.model.js';

// Pexels API Service
import { fetchVideosByQuery, VIDEO_QUERIES } from './src/services/pexels.service.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URL = process.env.MONGODB_URL;
const USE_PEXELS_API = process.env.PEXELS_API_KEY ? true : false;

if (!MONGODB_URL) {
    console.error('❌ MONGODB_URL not found in .env');
    process.exit(1);
}

console.log(`🎥 Seeding mode: ${USE_PEXELS_API ? 'Pexels API (Dynamic)' : 'Fallback URLs (Static)'}`);

// User data (same as before)
const USERS_DATA = [
    { name: "Aarav Sharma", gender: "men" }, { name: "Priya Patel", gender: "women" },
    { name: "Vihaan Kumar", gender: "men" }, { name: "Diya Gupta", gender: "women" },
    { name: "Arjun Singh", gender: "men" }, { name: "Ananya Reddy", gender: "women" },
    { name: "Rohan Verma", gender: "men" }, { name: "Ishita Rao", gender: "women" },
    { name: "Aditya Mishra", gender: "men" }, { name: "Kavya Joshi", gender: "women" },
    { name: "Sai Krishna", gender: "men" }, { name: "Neha Agarwal", gender: "women" },
    { name: "Kabir Das", gender: "men" }, { name: "Meera Nair", gender: "women" },
    { name: "Dhruv Desai", gender: "men" }, { name: "Sanya Kapoor", gender: "women" },
    { name: "Aryan Mahajan", gender: "men" }, { name: "Kriti Bhatia", gender: "women" },
    { name: "Vivaan Ahuja", gender: "men" }, { name: "Riya Chawla", gender: "women" },
    { name: "Ranveer Singh", gender: "men" }, { name: "Alia Bhatt", gender: "women" },
    { name: "Rishabh Pant", gender: "men" }, { name: "Smriti Mandhana", gender: "women" },
    { name: "Kartik Aaryan", gender: "men" }, { name: "Kiara Advani", gender: "women" },
    { name: "Ayushmann Khurrana", gender: "men" }, { name: "Shraddha Kapoor", gender: "women" },
    { name: "Rajkummar Rao", gender: "men" }, { name: "Tapsee Pannu", gender: "women" }
];

// Fallback video URLs (if Pexels API not available)
const FALLBACK_VIDEOS = {
    Comedy: [
        { url: "https://assets.mixkit.co/videos/preview/mixkit-going-down-on-a-curved-highway-down-a-mountainside-41576-large.mp4", title: "Road Adventure 🚗", description: "Scenic drive through mountains #travel #adventure" },
        { url: "https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4", title: "Ocean Waves 🌊", description: "Relaxing beach vibes #ocean #nature" },
        { url: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Nature Scene 🌳", description: "Beautiful forest moments #nature #peaceful" }
    ],
    Gaming: [
        { url: "https://assets.mixkit.co/videos/preview/mixkit-man-playing-in-a-vr-headset-4404-large.mp4", title: "VR Gaming 🎮", description: "Immersive virtual reality experience #gaming #vr" },
        { url: "https://assets.mixkit.co/videos/preview/mixkit-gamer-girl-playing-on-her-cell-phone-in-a-neon-room-26053-large.mp4", title: "Mobile Gaming 📱", description: "Neon gaming setup #mobile #gaming" }
    ],
    Traveling: [
        { url: "https://assets.mixkit.co/videos/preview/mixkit-curvy-road-between-green-hills-4144-large.mp4", title: "Mountain Road 🏔️", description: "Epic road trip through hills #travel #roadtrip" },
        { url: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4", title: "Forest Stream 🌲", description: "Peaceful forest exploration #nature #travel" }
    ],
    Nature: [
        { url: "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-over-the-ocean-4062-large.mp4", title: "Ocean Sunset 🌅", description: "Beautiful golden hour #sunset #ocean" }
    ],
    Food: [
        { url: "https://assets.mixkit.co/videos/preview/mixkit-man-grilling-meat-on-a-bbq-4438-large.mp4", title: "BBQ Cooking 🍖", description: "Perfect grill techniques #food #cooking" }
    ],
    Lifestyle: [
        { url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1282-large.mp4", title: "Neon Vibes ✨", description: "Urban lifestyle aesthetic #lifestyle #vibes" },
        { url: "https://assets.mixkit.co/videos/preview/mixkit-man-working-hard-on-his-computer-332-large.mp4", title: "Work Mode 💻", description: "Productive grind #work #productivity" }
    ],
    Tech: [
        { url: "https://assets.mixkit.co/videos/preview/mixkit-computer-keyboard-light-up-in-the-dark-23916-large.mp4", title: "Tech Setup ⌨️", description: "RGB keyboard vibes #tech #gaming" },
        { url: "https://assets.mixkit.co/videos/preview/mixkit-programmer-working-on-his-laptop-4922-large.mp4", title: "Coding Session 👨‍💻", description: "Developer life #coding #tech" }
    ],
    Education: [
        { url: "https://assets.mixkit.co/videos/preview/mixkit-young-man-looking-at-a-map-and-a-compass-in-nature-32803-large.mp4", title: "Navigation Skills 🧭", description: "Learning outdoor survival #education #skills" },
        { url: "https://assets.mixkit.co/videos/preview/mixkit-student-girl-working-on-her-computer-at-home-4785-large.mp4", title: "Online Learning 📚", description: "Study from home #education #online" }
    ]
};

/**
 * Fetch videos using Pexels API
 */
async function fetchPexelsVideos() {
    console.log('🎬 Fetching videos from Pexels API...\n');
    
    const videosByCategory = {};
    
    for (const [category, query] of Object.entries(VIDEO_QUERIES)) {
        console.log(`📹 Fetching ${category} videos...`);
        
        const videos = await fetchVideosByQuery(query, 3);
        
        if (videos.length > 0) {
            videosByCategory[category] = videos.map((v, index) => ({
                url: v.url,
                title: `${category} Moment ${index + 1} 🎬`,
                description: `Amazing ${category.toLowerCase()} content by ${v.photographer} #${category.toLowerCase()} #viral`
            }));
            console.log(`   ✅ Found ${videos.length} videos`);
        } else {
            console.log(`   ⚠️  No videos found, using fallback`);
            videosByCategory[category] = FALLBACK_VIDEOS[category] || [];
        }
        
        // Respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log('\n✅ Video fetching complete!\n');
    return videosByCategory;
}

/**
 * Create reel templates from videos
 */
function createReelTemplates(videosByCategory) {
    const templates = [];
    
    for (const [category, videos] of Object.entries(videosByCategory)) {
        if (videos && videos.length > 0) {
            templates.push({
                category,
                videos: videos.slice(0, 5) // Max 5 per category
            });
        }
    }
    
    return templates;
}

/**
 * Main seed function
 */
async function seed() {
    try {
        console.log('🚀 Starting ReelSthan seed process...\n');
        
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URL);
        console.log('✅ Connected to MongoDB\n');
        
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Reel.deleteMany({});
        console.log('✅ Database cleared\n');
        
        // Create users
        console.log('👥 Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = await Promise.all(
            USERS_DATA.map(async (userData) => {
                const username = userData.name.toLowerCase().replace(/\s+/g, '');
                const email = `${username}@example.com`;
                const avatarUrl = `https://randomuser.me/api/portraits/${userData.gender}/${Math.floor(Math.random() * 90)}.jpg`;
                
                const user = await User.create({
                    name: userData.name,
                    username,
                    email,
                    password: hashedPassword,
                    avatarUrl,
                    bio: `${userData.name} | Content Creator 🎬`,
                    isVerified: true
                });
                
                return user;
            })
        );
        console.log(`✅ Created ${users.length} users\n`);
        
        // Fetch or use fallback videos
        let videosByCategory;
        if (USE_PEXELS_API) {
            videosByCategory = await fetchPexelsVideos();
        } else {
            console.log('⚠️  Using fallback video URLs (no Pexels API key)\n');
            videosByCategory = FALLBACK_VIDEOS;
        }
        
        const REEL_TEMPLATES = createReelTemplates(videosByCategory);
        
        // Create reels
        console.log('🎬 Creating reels...');
        let reelCount = 0;
        
        for (const template of REEL_TEMPLATES) {
            for (const video of template.videos) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                
                await Reel.create({
                    title: video.title,
                    description: video.description,
                    videoUrl: video.url,
                    uploadedBy: randomUser._id,
                    user: randomUser._id,
                    like: [],
                    comments: [],
                    saves: [],
                    shareCount: Math.floor(Math.random() * 50)
                });
                
                reelCount++;
            }
        }
        
        console.log(`✅ Created ${reelCount} reels\n`);
        
        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SEED SUCCESSFUL!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👥 Users: ${users.length}`);
        console.log(`🎬 Reels: ${reelCount}`);
        console.log(`📹 Video source: ${USE_PEXELS_API ? 'Pexels API' : 'Fallback URLs'}`);
        console.log('\n📝 Test Account:');
        console.log(`   Email: ${users[0].email}`);
        console.log(`   Password: password123`);
        console.log('\n🎉 You can now run the app!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
    } catch (error) {
        console.error('❌ Seed failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run seed
seed();
