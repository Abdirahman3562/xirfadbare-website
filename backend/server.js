import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import authorRoutes from './routes/authorRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import userProgressRoutes from './routes/userProgressRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Import models to ensure they're registered with Mongoose
import './models/Blog.js';
import './models/Comment.js';

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/progress', userProgressRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/contacts', contactRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));

