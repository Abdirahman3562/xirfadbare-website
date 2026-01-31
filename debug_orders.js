import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './backend/models/Order.js';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/xirfadbare");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debugOrders = async () => {
    await connectDB();

    console.log("--- PENDING ORDERS ---");
    const pending = await Order.find({ status: 'pending' });
    console.log(JSON.stringify(pending, null, 2));

    console.log("--- ACTIVE ORDERS ---");
    const active = await Order.find({ status: 'active' });
    console.log(JSON.stringify(active, null, 2));

    console.log("--- ALL ORDERS (COUNT) ---");
    const count = await Order.countDocuments({});
    console.log(`Total: ${count}`);

    process.exit();
};

debugOrders();
