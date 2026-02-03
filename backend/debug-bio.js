import mongoose from 'mongoose';
import dotenv from 'dotenv';
const { Schema, model } = mongoose;

dotenv.config();

// Use a dynamic schema to see EVERYTHING
const dynamicUserSchema = new Schema({}, { strict: false });
const User = model('User', dynamicUserSchema, 'users');

const checkUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = await User.find({}).limit(5);
        console.log(`Found ${users.length} users.`);

        users.forEach(u => {
            const data = u.toObject();
            console.log(`User ID: ${data._id}`);
            console.log(`Name: ${data.firstName} ${data.lastName}`);
            console.log(`Email: ${data.email}`);
            console.log(`All Keys: ${Object.keys(data).sort().join(', ')}`);
            if (data.bio) console.log(`Bio: "${data.bio}"`);
            if (data.description) console.log(`Description: "${data.description}"`);
            console.log('---');
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
