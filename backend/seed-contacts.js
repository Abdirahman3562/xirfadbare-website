import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Contact from './models/Contact.js';

dotenv.config();
connectDB();

const contacts = [
  {
    name: 'Ahmed Hassan',
    phone: '+252 615 123456',
    email: 'ahmed.hassan@example.com',
    about: 'Course Inquiry',
    message: 'Hello, I am interested in your web development course. Can you provide more details about the curriculum and pricing?',
    status: 'unread'
  },
  {
    name: 'Fatima Ali',
    phone: '+252 617 987654',
    email: 'fatima.ali@example.com',
    about: 'Technical Support',
    message: 'I am having trouble accessing my course materials. The login page keeps showing an error. Can you help me resolve this?',
    status: 'read'
  },
  {
    name: 'Mohamed Yusuf',
    phone: '+252 618 456789',
    email: 'mohamed.yusuf@example.com',
    about: 'Partnership Opportunity',
    message: 'I represent a local tech company and we are interested in partnering with you for corporate training programs. Please contact me to discuss possibilities.',
    status: 'replied'
  },
  {
    name: 'Amina Omar',
    phone: '+252 619 321654',
    email: 'amina.omar@example.com',
    about: 'Feedback',
    message: 'I just completed the React course and I wanted to thank you for the excellent content. The instructors were very knowledgeable and the projects were practical. Highly recommended!',
    status: 'read'
  },
  {
    name: 'Hassan Ahmed',
    phone: '+252 616 789123',
    email: 'hassan.ahmed@example.com',
    about: 'Billing Question',
    message: 'I was charged twice for my course purchase. Can you please check my account and refund the duplicate charge?',
    status: 'unread'
  }
];

const importData = async () => {
  try {
    await Contact.deleteMany();
    await Contact.insertMany(contacts);

    console.log('✅ Contact messages data imported successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error importing contact data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Contact.deleteMany();
    console.log('✅ Contact messages data destroyed!');
    process.exit();
  } catch (error) {
    console.error('❌ Error destroying contact data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}


