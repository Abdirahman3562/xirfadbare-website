import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './models/Role.js';

dotenv.config();

const seedRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if roles already exist
        const existingRoles = await Role.find({});
        if (existingRoles.length > 0) {
            console.log('⚠️  Roles already exist in database. Skipping seed.');
            console.log('Existing roles:', existingRoles.map(r => r.name).join(', '));
            process.exit(0);
        }

        // Default roles to seed
        const defaultRoles = [
            {
                name: 'Student',
                description: 'Regular student with access to courses and learning materials',
                permissions: ['view_courses', 'enroll_courses', 'view_profile', 'edit_profile']
            },
            {
                name: 'Instructor',
                description: 'Course instructor who can create and manage courses',
                permissions: ['view_courses', 'create_courses', 'edit_courses', 'view_students', 'view_profile', 'edit_profile']
            },
            {
                name: 'Admin',
                description: 'System administrator with full access',
                permissions: ['*'] // All permissions
            },
            {
                name: 'Teacher',
                description: 'Teacher role with course management capabilities',
                permissions: ['view_courses', 'create_courses', 'edit_courses', 'view_students', 'view_profile', 'edit_profile']
            }
        ];

        // Insert roles
        const createdRoles = await Role.insertMany(defaultRoles);
        console.log('✅ Successfully seeded roles:');
        createdRoles.forEach(role => {
            console.log(`   - ${role.name}: ${role.description}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        process.exit(1);
    }
};

seedRoles();
