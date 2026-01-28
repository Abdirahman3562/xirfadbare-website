import Blog from '../models/Blog.js';

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = async (req, res) => {
    try {
        const { title, content, category, thumbnail, status } = req.body;

        const blog = new Blog({
            title,
            content,
            category,
            author: req.user._id, // Assign logged-in user
            thumbnail,
            status: status || 'pending',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        });

        const createdBlog = await blog.save();
        res.status(201).json(createdBlog);
    } catch (error) {
        res.status(500).json({ message: 'Error creating blog', error: error.message });
    }
};

// @desc    Get all blog posts
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
    try {
        const count = await Blog.countDocuments({});
        const blogs = await Blog.find({})
            .populate('author', 'firstName lastName image username bio social verified location') // Populate full User fields
            .sort({ createdAt: -1 });

        res.json({ blogs, count });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
};

// @desc    Get single blog post
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'firstName lastName image');

        if (blog) {
            res.json(blog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blog', error: error.message });
    }
};

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private/Admin
export const updateBlog = async (req, res) => {
    try {
        const { title, content, category, thumbnail, status } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (blog) {
            blog.title = title || blog.title;
            blog.content = content || blog.content;
            blog.category = category || blog.category;
            blog.thumbnail = thumbnail || blog.thumbnail;
            blog.status = status || blog.status;

            const updatedBlog = await blog.save();
            res.json(updatedBlog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating blog', error: error.message });
    }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (blog) {
            await blog.deleteOne();
            res.json({ message: 'Blog removed' });
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting blog', error: error.message });
    }
};

// @desc    Get blogs by author ID
// @route   GET /api/blogs/author/:authorId
// @access  Public
export const getBlogsByAuthor = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.params.authorId, status: 'active' })
            .populate('author', 'firstName lastName image username bio social verified location')
            .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching author blogs', error: error.message });
    }
};
