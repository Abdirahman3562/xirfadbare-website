import express from 'express';
import Author from '../models/Author.js';

const router = express.Router();

// ✅ Get all authors
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find({});
    res.json(authors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get single author by ID
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.json(author);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get author by username
router.get('/username/:username', async (req, res) => {
  try {
    const author = await Author.findOne({ username: req.params.username });
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    res.json(author);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


