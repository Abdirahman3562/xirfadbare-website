import express from 'express';
import Blog from '../models/Blog.js';
import Author from '../models/Author.js';

const router = express.Router();

// ✅ Get all blogs with author details
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({}).populate('author', 'name avatar verified username');
    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get single blog by ID with author details
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name avatar verified username bio');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get blogs by author ID
router.get('/author/:authorId', async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.authorId }).populate('author', 'name avatar verified username');
    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update entire blog (PUT method)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`📝 Updating blog: ${id}`);
    console.log('📋 Update data:', updateData);

    const blog = await Blog.findById(id);
    if (!blog) {
      console.log(`❌ Blog not found: ${id}`);
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Update the blog with new data (including comments)
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar verified username');

    console.log(`✅ Blog updated successfully: ${id}`);

    res.json({
      success: true,
      data: updatedBlog,
      message: 'Blog updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: error.message
    });
  }
});

export default router;

