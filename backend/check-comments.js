import mongoose from 'mongoose';
import Blog from './models/Blog.js';

// Temporary Comment model to read existing comments
const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

async function checkComments() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
    console.log('✅ Connected to database');

    // Check existing separate comments
    const separateComments = await Comment.find({}).limit(5);
    console.log(`📊 Separate comments collection has ${separateComments.length} comments`);

    if (separateComments.length > 0) {
      console.log('🔍 First separate comment:', {
        _id: separateComments[0]._id,
        content: separateComments[0].content,
        blog: separateComments[0].blog,
        author: separateComments[0].author,
        parentComment: separateComments[0].parentComment,
        replies: separateComments[0].replies
      });
    }

    // Check embedded comments in blogs
    const blogsWithComments = await Blog.find({ 'comments.0': { $exists: true } }).limit(5);
    console.log(`📊 ${blogsWithComments.length} blogs have embedded comments`);

    if (blogsWithComments.length > 0) {
      const blog = blogsWithComments[0];
      console.log(`🔍 Blog "${blog.title}" has ${blog.comments.length} embedded comments`);
      if (blog.comments.length > 0) {
        console.log('🔍 First embedded comment:', {
          _id: blog.comments[0]._id,
          content: blog.comments[0].content,
          author: blog.comments[0].author,
          parentComment: blog.comments[0].parentComment,
          repliesCount: blog.comments[0].replies?.length || 0
        });
      }
    }

    // Check total embedded comments count
    const totalEmbedded = await Blog.aggregate([
      { $unwind: '$comments' },
      { $count: 'total' }
    ]);

    console.log(`📊 Total embedded comments across all blogs: ${totalEmbedded[0]?.total || 0}`);

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
}

// Run the check
checkComments();

