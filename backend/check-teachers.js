import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();
connectDB();

const checkTeachers = async () => {
    try {
        const teachers = await User.find({ role: 'teacher' });
        console.log('\n=== TEACHERS IN DATABASE ===');
        console.log(`Total teachers: ${teachers.length}`);

        teachers.forEach((teacher, index) => {
            console.log(`\n${index + 1}. ${teacher.firstName} ${teacher.lastName}`);
            console.log(`   Email: ${teacher.email}`);
            console.log(`   Role: ${teacher.role}`);
        });

        const allUsers = await User.find();
        console.log(`\n=== ALL USERS ===`);
        console.log(`Total users: ${allUsers.length}`);

        const roleCount = {};
        allUsers.forEach(user => {
            roleCount[user.role] = (roleCount[user.role] || 0) + 1;
        });

        console.log('\nUsers by role:');
        Object.entries(roleCount).forEach(([role, count]) => {
            console.log(`  ${role}: ${count}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkTeachers();
