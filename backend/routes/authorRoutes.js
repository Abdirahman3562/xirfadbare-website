import express from 'express';
import Author from '../models/Author.js';

const router = express.Router();

// ✅ Get all authors
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find({}).sort({ createdAt: -1 });
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

// ✅ Create author
router.post('/', async (req, res) => {
  try {
    const author = new Author(req.body);
    const createdAuthor = await author.save();
    res.status(201).json(createdAuthor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid data provided' });
  }
});

// ✅ Update author
router.patch('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    Object.assign(author, req.body);
    const updatedAuthor = await author.save();
    res.json(updatedAuthor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Update failed' });
  }
});

// ✅ Delete author
router.delete('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    await author.deleteOne();
    res.json({ message: 'Author removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
