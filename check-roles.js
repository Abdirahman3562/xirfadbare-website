import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './backend/models/Role.js';

dotenv.config({ path: './backend/.env' });

const checkRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
        const roles = await Role.find({});
        console.log('Roles in DB:', JSON.stringify(roles, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkRoles();
