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

// 75 Indian Users (mix of male and female)
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
    { name: "Rajkummar Rao", gender: "men" }, { name: "Tapsee Pannu", gender: "women" },
    { name: "Siddharth Malhotra", gender: "men" }, { name: "Pooja Hegde", gender: "women" },
    { name: "Vicky Kaushal", gender: "men" }, { name: "Rashmika Mandanna", gender: "women" },
    { name: "Tiger Shroff", gender: "men" }, { name: "Samantha Ruth", gender: "women" },
    { name: "Varun Dhawan", gender: "men" }, { name: "Kajal Aggarwal", gender: "women" },
    { name: "Shahid Kapoor", gender: "men" }, { name: "Tamannaah Bhatia", gender: "women" },
    { name: "Akshay Kumar", gender: "men" }, { name: "Keerthy Suresh", gender: "women" },
    { name: "Salman Khan", gender: "men" }, { name: "Nayanthara", gender: "women" },
    { name: "Aamir Khan", gender: "men" }, { name: "Trisha Krishnan", gender: "women" },
    { name: "Shah Rukh Khan", gender: "men" }, { name: "Shriya Saran", gender: "women" },
    { name: "Hrithik Roshan", gender: "men" }, { name: "Ileana DCruz", gender: "women" },
    { name: "Ranbir Kapoor", gender: "men" }, { name: "Deepika Padukone", gender: "women" },
    { name: "Ranveer Singh", gender: "men" }, { name: "Katrina Kaif", gender: "women" },
    { name: "Vicky Kaushal", gender: "men" }, { name: "Anushka Sharma", gender: "women" },
    { name: "Kartik Aryan", gender: "men" }, { name: "Sonam Kapoor", gender: "women" },
    { name: "Sushant Singh", gender: "men" }, { name: "Jacqueline Fernandez", gender: "women" },
    { name: "Arjun Kapoor", gender: "men" }, { name: "Nargis Fakhri", gender: "women" },
    { name: "Sonu Sood", gender: "men" }, { name: "Lisa Haydon", gender: "women" },
    { name: "Nawazuddin Siddiqui", gender: "men" }, { name: "Kalki Koechlin", gender: "women" },
    { name: "Pankaj Tripathi", gender: "men" }, { name: "Konkona Sen Sharma", gender: "women" },
    { name: "Rajkumar Rao", gender: "men" }, { name: "Radhika Apte", gender: "women" },
    { name: "Gulshan Devaiah", gender: "men" }, { name: "Bhumi Pednekar", gender: "women" },
    { name: "Abhay Deol", gender: "men" }, { name: "Kriti Sanon", gender: "women" },
    { name: "Imran Khan", gender: "men" }, { name: "Disha Patani", gender: "women" },
    { name: "Riteish Deshmukh", gender: "men" }, { name: "Ananya Panday", gender: "women" },
    { name: "Farhan Akhtar", gender: "men" }, { name: "Sara Ali Khan", gender: "women" },
    { name: "Arshad Warsi", gender: "men" }, { name: "Janhvi Kapoor", gender: "women" },
    { name: "Mohit Suri", gender: "men" }, { name: "Khushi Kapoor", gender: "women" },
    { name: "Karan Johar", gender: "men" }, { name: "Suhana Khan", gender: "women" },
    { name: "Rohit Shetty", gender: "men" }, { name: "Mira Kapoor", gender: "women" },
    { name: "Ayan Mukerji", gender: "men" }, { name: "Veda Kapoor", gender: "women" },
    { name: "Kabir Khan", gender: "men" }, { name: "Savera Kapoor", gender: "women" },
    { name: "Anurag Kashyap", gender: "men" }, { name: "Amaan Kapoor", gender: "women" },
    { name: "Rajkumar Hirani", gender: "men" }, { name: "Armaan Kapoor", gender: "women" }
];

// Categorized Reel Templates with high-quality, verified URLs
const REEL_TEMPLATES = [
    {
        category: "Comedy",
        videos: [
            { url: "https://www.youtube.com/shorts/ZT8YJuLewLU", title: "Dada ka Intekaam 😎💪🏻", description: "Wait for the end! #comedy #funny #shorts #skit" },
            { url: "https://www.youtube.com/shorts/80edTtIJ9Rk", title: "Donation ka Paisa Kha gaye 😂", description: "Relatable? Tag that one friend! #humor #indiancomedy #fun" },
            { url: "https://www.youtube.com/shorts/UghRtKYLBXQ", title: "Travel Safety Skit 🚆", description: "Always keep an eye on your phone! 😂 #shorts #trainjourney #comedy" }
        ]
    },
    {
        category: "Gaming",
        videos: [
            { url: "https://www.youtube.com/shorts/A-PWu6S9kdA", title: "The Great Escape 🦁", description: "Can she save him in time? #gaming #adventure #epicmoments" },
            { url: "https://www.youtube.com/shorts/D0cRtY5KBHI", title: "RDR2 Lion Hunt 😱", description: "Trying to catch a lion with a rope... genius or crazy? #rdr2 #gamingmemes #wildlife" },
            { url: "https://www.youtube.com/shorts/1hbXt0R-5S8", title: "Desert Rampage ⚔️", description: "Things got wild in the desert today! #gamingcommunity #rdr2 #action" }
        ]
    },
    {
        category: "Traveling",
        videos: [
            { url: "https://www.youtube.com/shorts/B1KIH591tW8", title: "Autumn Waterfall 🌊", description: "Nature's masterpiece in full bloom. #travel #nature #waterfall #autumn" },
            { url: "https://www.youtube.com/shorts/KcuzlNKjb34", title: "Train Journey Stories 🚆", description: "Met the most interesting person on the way. #incredibleindia #traveldiaries #vlog" },
            { url: "https://www.youtube.com/shorts/pZpOmbAG25M", title: "Tea Garden Serenity 🍃", description: "Waking up to this view is a dream. #travelgram #nature #peace #teagarden" },
            { url: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Hidden Forest Gem 🐇", description: "Found this magical spot today! ✨ #wanderlust #nature #explore" },
        ]
    },
    {
        category: "Education",
        videos: [
            { url: "https://www.youtube.com/shorts/FdoQ4zT929Q", title: "Rarest Rainfalls 🌩️", description: "Did you know it can rain diamonds? 💎 #sciencefacts #universe #education" },
            { url: "https://www.youtube.com/shorts/jsuaPTOespw", title: "Moon Formation Secrets 🌕", description: "The theory that changed everything. #space #astronomy #learning" },
            { url: "https://www.youtube.com/shorts/Q2pquJ2FlzA", title: "Earth vs The Universe 🌍", description: "Perspective is everything. #didyouknow #earth #facts" }        ]
    },
    {
        category: "Lifestyle",
        videos: [
            { url: "https://www.youtube.com/shorts/vr4p_Vp6cxw", title: "Morning ASMR Cooking 🥐", description: "Starting the day with the perfect crunch. #lifestyle #asmr #morningroutine" },
            { url: "https://www.youtube.com/shorts/3SVi80fjs7U", title: "Homemade Snacks 🥔", description: "Budget friendly and delicious! #cooking #lifestyle #hacks" },
            { url: "https://www.youtube.com/shorts/ni_HSCBqDlM", title: "Street Style Vibe 🍜", description: "Late night city scenes and good food. #dailyvlog #delhidiaries #lifestyle" }        ]
    },
    {
        category: "Food",
        videos: [
            { url: "https://www.youtube.com/shorts/TD-c7yRkEWI", title: "Twisted Aloo Paratha 🥔", description: "A new take on a classic breakfast! #foodie #cooking #recipe" },
            { url: "https://www.youtube.com/shorts/907vZOyWTo8", title: "Delicious Secret Recipe 🔥", description: "You won't believe the secret ingredient. #chefmode #food #yummy" },
            { url: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-946-large.mp4", title: "Family Baking Day 🧁", description: "Sweet moments in the kitchen. #family #food #happiness" }        ]
    },
    {
        category: "Nature",
        videos: [
            { url: "https://www.youtube.com/shorts/G9NRzrx7m4U", title: "Switzerland 4K Beauty 🇨🇭", description: "Is this real or a dream? #nature #switzerland #travel #4k" },
            { url: "https://www.youtube.com/shorts/xQknAlRnaM4", title: "Summer Rain Vibes 🌧️", description: "The smell of rain is everything. #peace #nature #rainyday" },
            { url: "https://www.youtube.com/shorts/Y7iB9uYF6AU", title: "Natural Mountain Vibe 🏔️", description: "Above the clouds, everything is calm. #mountains #nature #peace" }        ]
    },
    {
        category: "Tech",
        videos: [
            { url: "https://www.youtube.com/shorts/ZjxiNW-6aPU", title: "3 Must-Have Gadgets 📱", description: "These will change how you use your phone! #tech #gadgets #cooltech" },
            { url: "https://www.youtube.com/shorts/9Gf6Vm7efTE", title: "World's Top Tech Hacks ⚡", description: "Simple solutions to common tech problems. #techtips #hacks #productivity" },
            { url: "https://www.youtube.com/shorts/KCeEjhDMIv4", title: "Insane Screen Tech 🤯", description: "Wait until you see the resolution on this... #samsung #tech #future" }
        ]
    },
    {
        category: "Animals",
        videos: [
            { url: "https://www.youtube.com/shorts/MObqFN_Jr6U", title: "Lion Unloading Wildness 🦁", description: "The raw power of the king of the jungle. #wildlife #nature #animals" },
            { url: "https://www.youtube.com/shorts/mkN5pblyBoU", title: "Funny Donkey Laugh 😂", description: "Best thing you'll see today! #funnyanimals #animals #lmao" },
            { url: "https://www.youtube.com/shorts/-TjojsxYU6U", title: "Animal Fails 2024 🐱", description: "They never fail to make us laugh. #pets #funnyvideos #animals" },
            { url: "https://www.youtube.com/shorts/6bBWHhoAq6I", title: "Smart Lion Outwits Prey 👑", description: "Strategy is key in the wild. #animals #wildlifephotography #lion" },
            { url: "https://www.youtube.com/shorts/6pRNg7Z-4QU", title: "Baby Kangaroo Pouch Peeking 🦘", description: "Too cute for words! #cuteanimals #wildlife #nature" }
        ]
    },
    {
        category: "Fitness",
        videos: [
            { url: "https://www.youtube.com/shorts/1H6ybczMrZk", title: "Gym Motivation 2024 💪", description: "Day 1 or One Day. You decide. #gym #fitness #motivation" },
            { url: "https://www.youtube.com/shorts/iP5JcCZeoJI", title: "At-Home Bodyweight Workout 🏠", description: "No equipment? No excuses! #homeworkout #fitness #health" },
            { url: "https://www.youtube.com/shorts/cU3PaJR7dMg", title: "Forearm Strength Secrets ✊", description: "Build real grip strength with these moves. #fitnesshacks #gymlife #training" },
            { url: "https://www.youtube.com/shorts/6tmshgbPtvM", title: "Core Conditioning 🧘", description: "A strong core is the foundation. #yoga #fitness #abs" },
            { url: "https://www.youtube.com/shorts/18QOLZT_CQg", title: "Quick Cardio Blast 🔥", description: "Get your heart rate up in 60 seconds! #cardio #fitness #burnfat" }
        ]
    }
];

const COMMENT_POOLS = {
    Comedy: [
        "LMAO so accurate! 😂", "This is literally my friend @aarav", "I'm dead 💀", "Tagging @priya because this is you",
        "Haha nice one!", "Bro the end was unexpected 😂", "Content king!", "Keep these coming!"
    ],
    Gaming: [
        "That clutch was insane! 🔥", "What's your setup?", "Add me on discord!", "Bro is a hacker 🤯",
        "Which game is this?", "Insane graphics!", "Pro level gameplay 🎮", "Teach me your ways!"
    ],
    Traveling: [
        "Adding this to my bucket list! 😍", "Where is this location?", "The view is breathtaking ✨", "India is beautiful 🇮🇳",
        "Need to visit ASAP!", "Which camera did you use?", "Pure bliss 🏔️", "Amazing capture!"
    ],
    Education: [
        "I never knew this! 🤯", "Actually very useful, thanks!", "Saving this for later 📌", "Great explanation!",
        "Finally someone explained it simply!", "Mind blown 🧠", "Wait, is this real?", "Thanks for the tip!"
    ],
    Lifestyle: [
        "Love the aesthetic! ✨", "Literal goals 🙌", "Where is that outfit from?", "So peaceful...",
        "I need that setup! 💻", "Vibe check passed ✅", "Clean edits!", "Major inspiration!"
    ],
    Food: [
        "Yummy! Need the recipe ASAP 🍝", "My mouth is watering 🤤", "So simple yet so good!", "Trying this tonight!",
        "Chef status! 🔥", "The presentation is 10/10", "Best food content on my feed!", "Save this for later 📌"
    ],
    Nature: [
        "Peaceful vibes only ✨", "Nature is the best therapy ❤️", "Where is this paradise?", "Incredible capture!",
        "Pure magic! 🌿", "I could watch this all day", "Breathtaking views 🏔️", "Mother nature at its best"
    ],
    Tech: [
        "Need this gadget in my life! 📱", "Tech is getting crazy 🤯", "Great tip, thanks!", "Which model is that?",
        "Future is here! 🤖", "Clean setup man!", "Is this available in India?", "Adding to my wishlist 🛒"
    ],
    Animals: [
        "So cute! I can't even... 🥺", "Nature is wild 🦁", "Made my day! ❤️", "Look at that face!",
        "Pure innocence! 🐾", "Animals are better than people 😂", "Majestic capture!", "LOL so funny!"
    ],
    Fitness: [
        "Pure motivation! 💪", "Needed this today, thanks!", "Form is perfect! 🔥", "What's your split?",
        "Leg day loading... 🏋️‍♂️", "Consistency is key! ✅", "Looking beastly!", "Beast mode on! 🦁"
    ]
};

const generateRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateRandomDate = () => new Date(Date.now() - generateRandomInt(0, 30 * 24 * 60 * 60 * 1000));

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
        const NUM_USERS = 60; // Slightly reduced to better match unique video pool
        console.log(`👥 Creating ${NUM_USERS} users...`);
        const hashedDefaultPassword = await bcrypt.hash('password123', 10);
        const users = [];

        for (let i = 0; i < NUM_USERS; i++) {
            const userData = USERS_DATA[i % USERS_DATA.length];
            const username = userData.name.toLowerCase().replace(/\s/g, '') + generateRandomInt(100, 9999);
            const avatarNum = generateRandomInt(1, 90);

            const user = await User.create({
                name: userData.name,
                username: username,
                email: `${username}@example.com`,
                password: hashedDefaultPassword,
                bio: `Just ${userData.name} documenting life's highlights ✨ | Indian Vibes 🇮🇳`,
                avatarUrl: `https://randomuser.me/api/portraits/${userData.gender}/${avatarNum}.jpg`,
                isVerified: Math.random() > 0.85,
            });
            users.push(user);

            if ((i + 1) % 20 === 0) {
                console.log(`   Created ${i + 1}/${NUM_USERS} users...`);
            }
        }
        console.log(`✅ Created ${users.length} users`);

        // Prepare Unique Video Pool
        console.log('📹 Preparing unique video pool...');
        let allVideos = [];
        REEL_TEMPLATES.forEach(template => {
            template.videos.forEach(v => {
                allVideos.push({ ...v, category: template.category });
            });
        });

        // Shuffle pool
        allVideos = allVideos.sort(() => Math.random() - 0.5);
        console.log(`✅ Found ${allVideos.length} unique videos across ${REEL_TEMPLATES.length} categories`);

        // Create Reels - Use unique URLs from the pool
        console.log('📹 Seeding reels (1 per user to ensure uniqueness)...');
        const reels = [];
        const numReelsToCreate = Math.min(users.length, allVideos.length);

        for (let i = 0; i < numReelsToCreate; i++) {
            const user = users[i];
            const videoData = allVideos[i];

            const reel = await Reel.create({
                title: videoData.title,
                description: videoData.description,
                videoUrl: videoData.url,
                uploadedBy: String(user._id),
                user: user._id,
                shareCount: generateRandomInt(5, 150),
                category: videoData.category
            });
            reels.push(reel);

            if ((i + 1) % 20 === 0) {
                console.log(`   Assigned unique URL ${i + 1}/${numReelsToCreate}...`);
            }
        }
        console.log(`✅ Created ${reels.length} unique reels`);

        // Simulate Interactions
        console.log('❤️ Simulating realistic interactions...');

        for (let i = 0; i < reels.length; i++) {
            const reel = reels[i];

            // Add Likes (Random 10-100% of users)
            const numLikes = generateRandomInt(5, users.length);
            const likers = new Set();
            while (likers.size < numLikes) {
                likers.add(getRandomItem(users)._id);
            }
            reel.like = Array.from(likers).map(id => String(id));

            // Add Saves (Random 2-30% of users)
            const numSaves = generateRandomInt(2, Math.floor(users.length * 0.3) + 2);
            const savers = new Set();
            while (savers.size < numSaves) {
                savers.add(getRandomItem(users)._id);
            }
            reel.saves = Array.from(savers).map(id => String(id));

            // Add Related Comments (Random 3-15 comments)
            const numComments = generateRandomInt(3, 15);
            const categoryPool = COMMENT_POOLS[reel.category] || COMMENT_POOLS.Lifestyle;
            
            for (let k = 0; k < numComments; k++) {
                const commenter = getRandomItem(users);
                reel.comments.push({
                    user: String(commenter._id),
                    text: getRandomItem(categoryPool),
                    createdAt: generateRandomDate()
                });
            }

            await reel.save();

            if ((i + 1) % 50 === 0) {
                console.log(`   Processed interactions for ${i + 1}/${reels.length} reels...`);
            }
        }
        console.log('✅ Interactions and metadata finalized');

        console.log('\n🎉 SEEDING COMPLETE!');
        console.log('====================');
        console.log(`👥 Total Users: ${users.length}`);
        console.log(`📹 Total Unique Reels: ${reels.length}`);
        console.log('💰 Default Password: password123');
        console.log('\n📧 Sample login emails:');
        for (let i = 0; i < 5; i++) {
            console.log(`   - ${users[i].email}`);
        }
        console.log('\n🚀 Start backend with: npm run dev');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seed();

