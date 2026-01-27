import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Order from './models/Order.js';
import Testimonial from './models/Testimonial.js';
import Contact from './models/Contact.js';
import connectDB from './config/db.js';

async function checkData() {
  await connectDB();

  const users = await User.find({});
  const courses = await Course.find({});
  const orders = await Order.find({});
  const testimonials = await Testimonial.find({});
  const contacts = await Contact.find({});

  console.log('=== REAL DASHBOARD DATA ===');
  console.log('Total Users:', users.length);
  console.log('Total Courses:', courses.length);
  console.log('Total Orders:', orders.length);
  console.log('Total Testimonials:', testimonials.length);
  console.log('Total Contact Messages:', contacts.length);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.finalPrice || order.totalToPay || 0), 0);
  const activeUsers = orders.filter(order => order.status === 'active').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  console.log('Total Revenue:', '$' + totalRevenue);
  console.log('Active Users:', activeUsers);
  console.log('Pending Orders:', pendingOrders);

  console.log('\n=== SAMPLE USERS ===');
  users.slice(0, 3).forEach(user => {
    console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
  });

  console.log('\n=== SAMPLE COURSES ===');
  courses.slice(0, 3).forEach(course => {
    console.log(`- ${course.title} - $${course.price}`);
  });

  console.log('\n=== SAMPLE ORDERS ===');
  orders.slice(0, 3).forEach(order => {
    console.log(`- ${order.userDetails?.firstName} ${order.userDetails?.lastName} - ${order.courseDetails?.title} - $${order.finalPrice} - ${order.status}`);
  });

  process.exit(0);
}

checkData();


