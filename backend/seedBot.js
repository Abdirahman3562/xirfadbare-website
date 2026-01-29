import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BotResponse from './models/BotResponse.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedData = [
    {
        trigger: "hello",
        response: "Hello! Welcome to Samafale Academy. How can I help you today? 👋",
        matchType: "contains"
    },
    {
        trigger: "asc",
        response: "Waa-leikum Salaam! Kusoo dhawow Samafale Academy. Sidee baan kuu caawin karaa? 🤝",
        matchType: "contains"
    },
    {
        trigger: "hi",
        response: "Hi there! Ready to start learning? 🚀",
        matchType: "contains"
    },
    {
        trigger: "price",
        response: "Our courses are very affordable! Most courses start from just $10. Check specific course pages for details. 💲",
        matchType: "contains"
    },
    {
        trigger: "qiimaha",
        response: "Koorasyada badankoodu waxay ka bilowdaan $10 kaliya. Fadlan eeg koorsada aad rabto faahfaahinteeda. 🏷️",
        matchType: "contains"
    },
    {
        trigger: "kaalay",
        response: "Fadlan nala soo xiriir WhatsApp-ka ama naga wac lambarkas: +252 61 5000000. 📞",
        matchType: "contains"
    },
    {
        trigger: "contact",
        response: "You can reach us specifically on WhatsApp or call us at +252 61 5000000. 📱",
        matchType: "contains"
    },
    {
        trigger: "course",
        response: "We offer courses in Programming, Design, Business, and more! Browse our 'Courses' page to see them all. 📚",
        matchType: "contains"
    },
    {
        trigger: "koorso",
        response: "Waxaan bixinnaa koorasyo ku saabsan Programming, Design, iyo Business. Fadlan bogga 'Courses' ka eeg. 🎓",
        matchType: "contains"
    },
    {
        trigger: "login",
        response: "You can login by clicking the 'Sign In' button at the top right corner. If you don't have an account, please Sign Up first. 🔐",
        matchType: "contains"
    },
    {
        trigger: "gal",
        response: "Waxaad ku geli kartaa akoonkaaga adigoo riixaya 'Sign In'. Haddii aadan akoon lahayn, fadlan sameyso. 🔑",
        matchType: "contains"
    }
];

const seedDB = async () => {
    try {
        await BotResponse.deleteMany();
        console.log('Cleared existing bot responses...');

        await BotResponse.insertMany(seedData);
        console.log('✅ Bot Responses Seeded Successfully!');

        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

seedDB();
