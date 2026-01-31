import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Chat from './models/Chat.js';
import User from './models/User.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/samafale_academy");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugChat = async () => {
    await connectDB();

    console.log("--- UNREAD USER MESSAGES COUNT ---");
    const count = await Chat.countDocuments({ sender: 'user', read: false });
    console.log(`Count: ${count}`);

    console.log("--- LATEST UNREAD MESSAGE ---");
    const latestChat = await Chat.findOne({ sender: 'user', read: false })
        .sort({ createdAt: -1 })
        .populate('user', 'firstName lastName image');

    if (latestChat) {
        console.log("Raw Chat Object found.");
        console.log(`Message: ${latestChat.message}`);
        console.log(`Sender Field: ${latestChat.sender}`);
        if (latestChat.user) {
            console.log("User populated successfully:");
            console.log(JSON.stringify(latestChat.user, null, 2));
        } else {
            console.log("WARNING: User field is NULL (Orphaned Chat)");
            console.log(`User ID in Chat ref: ${latestChat.user}`);
        }
    } else {
        console.log("No unread messages found.");
    }

    process.exit();
};

debugChat();
