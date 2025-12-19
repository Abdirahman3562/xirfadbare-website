import Blog from '../models/Blog.js';
import User from '../models/User.js';

// @desc    Get all comments for a blog
// @route   GET /api/comments/:blogId
// @access  Public
const getCommentsByBlog = async (req, res) => {
  try {
    // Get blog with populated comments
    const blog = await Blog.findById(req.params.blogId)
      .populate({
        path: 'comments.author',
        select: 'firstName lastName image'
      })
      .populate({
        path: 'comments.replies.author',
        select: 'firstName lastName image'
      });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Filter and sort top-level comments (comments without parentComment)
    const topLevelComments = blog.comments
      .filter(comment => !comment.parentComment)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first

    // Format the comments to match the expected structure
    const formattedComments = topLevelComments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      author: comment.author,
      parentComment: comment.parentComment,
      replies: blog.comments
        .filter(reply => reply.parentComment && reply.parentComment.toString() === comment._id.toString())
        .map(reply => ({
          _id: reply._id,
          content: reply.content,
          author: reply.author,
          createdAt: reply.createdAt
        }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), // Sort replies chronologically
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const { content, blogId, parentCommentId } = req.body;

    if (!content || !blogId) {
      return res.status(400).json({ message: 'Content and blogId are required' });
    }

    // Check if blog exists and get user info for population
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const user = await User.findById(req.user._id).select('firstName lastName image');

    if (parentCommentId) {
      // This is a reply - check if parent comment exists in the blog's comments array
      const parentComment = blog.comments.id(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }

      // Create the reply object
      const reply = {
        content,
        author: req.user._id,
        parentComment: parentCommentId,
        replies: []
      };

      // Add the reply to the blog's comments array
      blog.comments.push(reply);
      await blog.save();

      // Get the newly added reply
      const newReply = blog.comments[blog.comments.length - 1];

      return res.status(201).json({
        _id: newReply._id,
        content: newReply.content,
        author: user,
        createdAt: newReply.createdAt
      });
    } else {
      // This is a top-level comment
      const comment = {
        content,
        author: req.user._id,
        parentComment: null,
        replies: []
      };

      // Add the comment to the blog's comments array
      blog.comments.push(comment);
      await blog.save();

      // Get the newly added comment
      const newComment = blog.comments[blog.comments.length - 1];

      res.status(201).json({
        _id: newComment._id,
        content: newComment.content,
        author: user,
        parentComment: newComment.parentComment,
        replies: newComment.replies,
        createdAt: newComment.createdAt,
        updatedAt: newComment.updatedAt
      });
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error while creating comment' });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    // Find the blog that contains this comment
    const blog = await Blog.findOne({ 'comments._id': req.params.id });
    if (!blog) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Find the specific comment in the blog's comments array
    const comment = blog.comments.id(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author of the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this comment' });
    }

    // Update the comment
    comment.content = content || comment.content;
    comment.updatedAt = new Date();
    await blog.save();

    // Get the updated comment with populated author
    const updatedBlog = await Blog.findById(blog._id)
      .populate({
        path: 'comments.author',
        select: 'firstName lastName image'
      })
      .populate({
        path: 'comments.replies.author',
        select: 'firstName lastName image'
      });

    const updatedComment = updatedBlog.comments.id(req.params.id);

    res.json({
      _id: updatedComment._id,
      content: updatedComment.content,
      author: updatedComment.author,
      parentComment: updatedComment.parentComment,
      replies: updatedBlog.comments.filter(reply =>
        reply.parentComment && reply.parentComment.toString() === req.params.id
      ).map(reply => ({
        _id: reply._id,
        content: reply.content,
        author: reply.author,
        createdAt: reply.createdAt
      })),
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Server error while updating comment' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    // Find the blog that contains this comment
    const blog = await Blog.findOne({ 'comments._id': req.params.id });
    if (!blog) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Find the specific comment in the blog's comments array
    const comment = blog.comments.id(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author of the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    // If this is a reply, remove it from the parent comment's replies array
    if (comment.parentComment) {
      const parentComment = blog.comments.id(comment.parentComment);
      if (parentComment) {
        parentComment.replies = parentComment.replies.filter(
          replyId => replyId.toString() !== req.params.id
        );
      }
    }

    // Delete all replies to this comment (if it's a top-level comment)
    if (!comment.parentComment) {
      // Remove all replies that have this comment as parent
      blog.comments = blog.comments.filter(c =>
        !(c.parentComment && c.parentComment.toString() === req.params.id)
      );
    }

    // Remove the comment itself
    blog.comments.pull({ _id: req.params.id });
    await blog.save();

    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
};

export { getCommentsByBlog, createComment, updateComment, deleteComment };
