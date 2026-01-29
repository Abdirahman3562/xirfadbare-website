import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BotResponse from './models/BotResponse.js';
import connectDB from './config/db.js';

dotenv.config();

const checkData = async () => {
    await connectDB();
    const count = await BotResponse.countDocuments();
    console.log(`Toatl Bot Responses in DB: ${count}`);
    const all = await BotResponse.find({});
    console.log(JSON.stringify(all, null, 2));
    process.exit();
};

checkData();
