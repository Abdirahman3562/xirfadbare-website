import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Route Imports
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
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
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import botResponseRoutes from './routes/botResponseRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import bundleRoutes from './routes/bundleRoutes.js';

// Model Imports (for registration)
import './models/Blog.js';
import './models/Comment.js';
import './models/Category.js';
import './models/Bundle.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
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
app.use('/api/payment-methods', paymentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bot-responses', botResponseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/bundles', bundleRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
