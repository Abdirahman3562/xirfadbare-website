import mongoose from 'mongoose';

const checkInstructors = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/samafale-academy');
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        const instructors = await db.collection('instructors').find({}).toArray();
        console.log(`👨‍🏫 Total Instructors: ${instructors.length}`);
        instructors.forEach(inst => {
            console.log(`- ${inst.name} (ID: ${inst._id}, Slug Search: ${inst.name.toLowerCase().replace(/\s+/g, '-')})`);
            console.log(`  Followers: ${inst.followers || 0}`);
            console.log(`  Reviews: ${inst.reviews ? inst.reviews.length : 0}`);
            console.log(`  About: ${inst.about ? 'Yes' : 'No'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkInstructors();
