import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testimonialSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    tag: { type: String },
    image: { type: String },
    quote: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

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

const seedTestimonials = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/xirfadbare');
    console.log('MongoDB Connected');

    // Clear existing testimonials
    await Testimonial.deleteMany({});
    console.log('Cleared existing testimonials');

    // Insert new testimonials
    await Testimonial.insertMany(testimonials);
    console.log('Testimonials seeded successfully');

    process.exit();
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    process.exit(1);
  }
};

seedTestimonials();


