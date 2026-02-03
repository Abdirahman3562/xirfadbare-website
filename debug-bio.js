import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';

dotenv.config({ path: './backend/.env' });

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).limit(5);
        users.forEach(u => {
            console.log(`User: ${u.firstName} ${u.lastName}`);
            console.log(`Email: ${u.email}`);
            console.log(`Bio: "${u.bio}"`);
            console.log(`Object keys: ${Object.keys(u._doc)}`);
            console.log('---');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUser();
