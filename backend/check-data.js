import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Order from './models/Order.js';
import Testimonial from './models/Testimonial.js';
import Contact from './models/Contact.js';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/samafale-academy');
    console.log('MongoDB Connected');

    const users = await User.countDocuments();
    const courses = await Course.countDocuments();
    const orders = await Order.countDocuments();
    const testimonials = await Testimonial.countDocuments();
    const contacts = await Contact.countDocuments();

    console.log('=== DATABASE COUNTS ===');
    console.log(`Users: ${users}`);
    console.log(`Courses: ${courses}`);
    console.log(`Orders: ${orders}`);
    console.log(`Testimonials: ${testimonials}`);
    console.log(`Contacts: ${contacts}`);

    // Get some sample data
    if (orders > 0) {
      const sampleOrder = await Order.findOne().populate('user', 'firstName lastName email');
      console.log('\n=== SAMPLE ORDER ===');
      console.log(`User: ${sampleOrder?.userDetails?.firstName || sampleOrder?.user?.firstName} ${sampleOrder?.userDetails?.lastName || sampleOrder?.user?.lastName}`);
      console.log(`Course: ${sampleOrder?.courseDetails?.title || sampleOrder?.courseTitle}`);
      console.log(`Price: $${sampleOrder?.finalPrice || sampleOrder?.totalToPay || 0}`);
      console.log(`Status: ${sampleOrder?.status}`);
    }

    if (testimonials > 0) {
      const sampleTestimonial = await Testimonial.findOne({ isActive: true });
      console.log('\n=== SAMPLE TESTIMONIAL ===');
      console.log(`Name: ${sampleTestimonial?.name}`);
      console.log(`Rating: ${sampleTestimonial?.rating}`);
      console.log(`Active: ${sampleTestimonial?.isActive}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking data:', error);
    process.exit(1);
  }
};

checkData();

