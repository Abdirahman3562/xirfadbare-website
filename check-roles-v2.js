import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

const roleSchema = new mongoose.Schema({
    name: String,
    description: String
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

const checkRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
        const roles = await Role.find({});
        console.log('Roles Count:', roles.length);
        console.log('Roles:', JSON.stringify(roles, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkRoles();
