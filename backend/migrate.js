import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

// 1. Linkiga Local-ka
const LOCAL_URI = 'mongodb://localhost:27017/samafale_academy';

// 2. Linkiga Cloud-ka (Halkan ayaan ka saxnay, waxaan ka dhignay MONGODB_URI)
const CLOUD_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Liiska Collections-ka
const COLLECTIONS_TO_MIGRATE = [
    'authors',
    'blogs',
    'botresponses',
    'bundles',
    'categories',
    'certificatetemplates',
    'chats',
    'comments',
    'contacts',
    'courses',
    'faqs',
    'instructors',
    'orders',
    'paymentmethods',
    'roles',
    'settings',
    'systemsettings',
    'testimonials',
    'userprogresses',
    'users'
];

async function migrateData() {
    console.log('🚀 Starting Migration...');

    try {
        // Hubi in Linkiga la helay
        if (!CLOUD_URI) {
            throw new Error("❌ MONGODB_URI lama helin! Fadlan hubi magaca ku dhex qoran .env file-kaaga.");
        }

        // Xiririnta Local DB
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('✅ Connected to LOCAL DB');

        // Xiririnta Cloud DB
        const cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();
        console.log('✅ Connected to CLOUD Atlas DB');

        console.log(`📋 Found ${COLLECTIONS_TO_MIGRATE.length} collections to migrate.`);

        for (const collectionName of COLLECTIONS_TO_MIGRATE) {
            console.log(`\n⏳ Processing: ${collectionName}...`);

            // 1. Soo qaado xogta Local-ka
            const localModel = localConn.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);
            const data = await localModel.find().lean();

            if (data.length === 0) {
                console.log(`⚠️  Empty collection (0 records), skipping.`);
                continue;
            }

            console.log(`📥 Found ${data.length} records in Local.`);

            // 2. Ku shub Cloud-ka
            const cloudModel = cloudConn.model(collectionName, new mongoose.Schema({}, { strict: false }), collectionName);

            try {
                // ordered: false means haddii mid cilad yeesho kuwa kale wuu wadaa
                await cloudModel.insertMany(data, { ordered: false });
                console.log(`🎉 Successfully migrated ${data.length} records to Cloud!`);
            } catch (err) {
                if (err.code === 11000) {
                    console.log(`⚠️  Duplicates found (skipped), but new records added.`);
                } else {
                    console.error(`❌ Error inserting data for ${collectionName}:`, err.message);
                }
            }
        }

        console.log('\n✅✅ MIGRATION COMPLETED SUCCESSFULLY! ✅✅');
        process.exit(0);

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        process.exit(1);
    }
}

migrateData();