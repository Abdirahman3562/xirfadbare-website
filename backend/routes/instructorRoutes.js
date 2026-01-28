import express from 'express';
import Instructor from '../models/Instructor.js';

const router = express.Router();

// ✅ Get all instructors
router.get('/', async (req, res) => {
  try {
    const instructors = await Instructor.find({});
    res.json(instructors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Create instructor
router.post('/', async (req, res) => {
  try {
    const instructor = new Instructor(req.body);
    const createdInstructor = await instructor.save();
    res.status(201).json(createdInstructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get single instructor by ID
router.get('/:id', async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.json(instructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get instructor by slug (name-based URL)
router.get('/slug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug.replace(/-/g, ' ');
    const instructor = await Instructor.findOne({
      name: { $regex: new RegExp(`^${slug}$`, 'i') }
    }).populate('reviews.user', 'image firstName lastName email');

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.json(instructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update instructor
router.patch('/:id', async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    res.json(instructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete instructor
router.delete('/:id', async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.json({ message: 'Instructor removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;



