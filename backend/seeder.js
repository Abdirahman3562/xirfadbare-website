import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Course from './models/Course.js';
import Instructor from './models/Instructor.js';
import Order from './models/Order.js';
import Blog from './models/Blog.js';
import Author from './models/Author.js';
import Testimonial from './models/Testimonial.js';
import FAQ from './models/FAQ.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await Instructor.deleteMany();
    await Order.deleteMany();
    await Blog.deleteMany();
    await Author.deleteMany();
    await Testimonial.deleteMany();
    await FAQ.deleteMany();

    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../front/src/data/users.json'), 'utf-8')).users;
    const instructors = JSON.parse(fs.readFileSync(path.join(__dirname, '../front/src/data/instructors.json'), 'utf-8')).instructors;
    const courses = JSON.parse(fs.readFileSync(path.join(__dirname, '../front/src/data/courses.json'), 'utf-8')).courses;
    const blogs = JSON.parse(fs.readFileSync(path.join(__dirname, '../front/src/data/blogs.json'), 'utf-8')).blogs;
    const authors = JSON.parse(fs.readFileSync(path.join(__dirname, '../front/src/data/authors.json'), 'utf-8')).authors;
    const curriculum = JSON.parse(fs.readFileSync(path.join(__dirname, '../front/src/data/curriculum.json'), 'utf-8')).curriculum;
    const lessons = JSON.parse(fs.readFileSync(path.join(__dirname, '../front/src/data/lessons.json'), 'utf-8')).lessons;

    // Map IDs to MongoDB ObjectIDs
    const instructorMap = {};
    const createdInstructors = await Instructor.insertMany(instructors.map(i => {
      const { id, ...rest } = i;
      return rest;
    }));
    instructors.forEach((inst, index) => {
      instructorMap[inst.id] = createdInstructors[index]._id;
    });

    const userMap = {};
    const processedUsers = await Promise.all(users.map(async u => {
      const { id, password, ...rest } = u;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      return { 
        ...rest, 
        password: hashedPassword,
        role: rest.email === 'abdirahmaanmoha2022@gmail.com' ? 'admin' : 'student' 
      };
    }));
    
    const createdUsers = await User.insertMany(processedUsers);
    users.forEach((u, index) => {
      userMap[u.id] = createdUsers[index]._id;
    });

    const authorMap = {};
    const createdAuthors = await Author.insertMany(authors.map(a => {
      const { id, ...rest } = a;
      return rest;
    }));
    authors.forEach((a, index) => {
      authorMap[a.id] = createdAuthors[index]._id;
    });

    const courseMap = {};
    const processedCourses = courses.map(c => {
      const { id, instructorId, ...rest } = c;
      const courseCurriculum = curriculum.filter(curr => curr.courseId == id).map(curr => {
        const currLessons = lessons.filter(l => l.curriculumId == curr.id).map(l => {
          const { id, curriculumId, ...lRest } = l;
          return lRest;
        });
        return { title: curr.title, lessons: currLessons };
      });

      return {
        ...rest,
        instructor: instructorMap[instructorId],
        curriculum: courseCurriculum
      };
    });

    const createdCourses = await Course.insertMany(processedCourses);
    courses.forEach((c, index) => {
      courseMap[c.id] = createdCourses[index]._id;
    });

    const processedBlogs = blogs.map(b => {
      const { id, authorId, ...rest } = b;
      return { ...rest, author: authorMap[authorId] };
    });
    await Blog.insertMany(processedBlogs);

    // Create testimonials
    const testimonials = [
      {
        name: "Ayaan Cabdi",
        role: "Frontend Developer",
        tag: "Built strong web design skills",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        quote: "Xirfadbare waa goob waxbarasho oo runtii wax ka bedeshay xirfadeyda. Tababarka iyo hagidda macallimiinta ayaa iga dhigay inaan si kalsooni leh u dhiso web apps xirfad leh.",
        rating: 5,
        order: 1,
      },
      {
        name: "Mohamed Abdi",
        role: "Full Stack Engineer",
        tag: "From learner to tech professional",
        image: "https://randomuser.me/api/portraits/men/41.jpg",
        quote: "Markii aan ku biiray Xirfadbare, waxaan bartay React, Node.js, iyo MongoDB. Waxay i siisay xirfad dhab ah iyo kalsooni aan shaqo ku helo si dhakhso ah.",
        rating: 5,
        order: 2,
      },
      {
        name: "Hodan Yusuf",
        role: "UI/UX Designer",
        tag: "Mastered modern design tools",
        image: "https://randomuser.me/api/portraits/women/31.jpg",
        quote: "Casharrada Xirfadbare waa kuwo la fahmi karo oo lagu tababaro si wax ku ool ah. Maanta waxaan si xirfad leh u isticmaalaa Figma iyo UX principles-ka casriga ah.",
        rating: 5,
        order: 3,
      },
      {
        name: "Khalid Ahmed",
        role: "Backend Developer",
        tag: "Enhanced API and database skills",
        image: "https://randomuser.me/api/portraits/men/53.jpg",
        quote: "Xirfadbare waxay i siisay aasaas adag oo ku saabsan backend development. Waxaan bartay Node.js, Express iyo MongoDB, taas oo iga dhigtay mid shaqadiisa si kalsooni leh u qabta.",
        rating: 5,
        order: 4,
      },
    ];

    await Testimonial.insertMany(testimonials);

    // Create FAQs
    const faqs = [
      {
        question: "Sideen uga diiwaan gali karaa koorsooyinka Xirfadbare?",
        answer: "Tag bogga 'Courses', dooro koorsada aad rabto, kadib guji 'Enroll Now'. Waxaad heli doontaa fariin xaqiijin ah iyo tillaabooyinka xiga ee bixinta ama bilaabista koorsada.",
        category: "enrollment",
        order: 1,
        language: "so",
      },
      {
        question: "Koorsooyinka Xirfadbare ma bilaash baa mise waa lacag leh?",
        answer: "Xirfadbare waxay bixisaa koorsooyin bilaash ah iyo kuwo premium ah. Koorsooyinka premium waxay bixiyaan waxyaabo dheeraad ah sida hagitaan toos ah, support gaar ah iyo fursado shaqo.",
        category: "pricing",
        order: 2,
        language: "so",
      },
      {
        question: "Ma heli karaa taageero haddii aan dhibaato kala kulmo koorsada?",
        answer: "Haa, kooxda support-ka ee Xirfadbare ayaa diyaar u ah inay ku caawiso 24/7. Waxaad nala soo xiriiri kartaa email, chat, ama qaybta support-ka ee website-ka.",
        category: "support",
        order: 3,
        language: "so",
      },
      {
        question: "Macallimiinta Xirfadbare ma yihiin xirfadlayaal dhab ah?",
        answer: "Haa, dhammaan macallimiinta waa khubaro ka tirsan shirkado caan ah oo leh waayo-aragnimo toos ah, waxayna si firfircoon uga shaqeeyaan warshadaha Technology-ga.",
        category: "instructors",
        order: 4,
        language: "so",
      },
      {
        question: "Ma heli karaa shahaado marka aan dhameeyo koorsada?",
        answer: "Haa, dhammaan ardayda dhameeya koorsooyinka waxay helayaan shahaado rasmi ah oo lagu aqoonsan karo shaqooyinka iyo CV-gaaga si xirfad leh.",
        category: "certificates",
        order: 5,
        language: "so",
      },
      {
        question: "Mudo intee le'eg ayay koorsooyinka socdaan?",
        answer: "Koorsooyinka badankood waxay socdaan 4 ilaa 12 toddobaad, iyadoo ku xiran nooca koorsada iyo heerka aqoonta ardayga.",
        category: "duration",
        order: 6,
        language: "so",
      },
      {
        question: "Ma isticmaali karaa Xirfadbare meel kasta?",
        answer: "Haa, Xirfadbare waa madal online ah. Waxaad ku baran kartaa meel kasta iyo waqti kasta adigoo isticmaalaya kombiyuutar ama mobilkaaga.",
        category: "accessibility",
        order: 7,
        language: "so",
      },
      {
        question: "Ma jiraan casharro ku saabsan xirfadaha shaqo raadinta?",
        answer: "Haa, Xirfadbare waxay bixisaa tababaro gaar ah oo kaa caawinaya diyaarinta CV-ga, wareysiyada shaqo, iyo xirfadaha soft skills ee loo baahan yahay suuqa shaqada maanta.",
        category: "career",
        order: 8,
        language: "so",
      },
    ];

    await FAQ.insertMany(faqs);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Course.deleteMany();
    await Instructor.deleteMany();
    await Order.deleteMany();
    await Blog.deleteMany();
    await Author.deleteMany();
    await Testimonial.deleteMany();
    await FAQ.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

