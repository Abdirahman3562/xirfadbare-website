import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';
import User from './models/User.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/xirfadbare');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const testComments = async () => {
  try {
    await connectDB();

    // Get a blog and user to test with
    const blog = await Blog.findOne({});
    const user = await User.findOne({});

    if (!blog) {
      console.error('No blogs found in database');
      process.exit(1);
    }

    if (!user) {
      console.error('No users found in database');
      process.exit(1);
    }

    console.log('Testing with:');
    console.log('- Blog ID:', blog._id);
    console.log('- User ID:', user._id);
    console.log('- Blog title:', blog.title);

    // Test adding a comment
    console.log('\n🧪 Testing comment creation...');
    const testComment = {
      content: 'This is a test comment from our automated test!',
      author: user._id,
      parentComment: null,
      replies: []
    };

    blog.comments.push(testComment);
    await blog.save();

    console.log('✅ Comment added successfully!');

    // Get the newly added comment
    const newComment = blog.comments[blog.comments.length - 1];
    console.log('📝 New comment ID:', newComment._id);
    console.log('💬 Comment content:', newComment.content);

    // Test adding a reply
    console.log('\n🧪 Testing reply creation...');
    const testReply = {
      content: 'This is a reply to the test comment!',
      author: user._id,
      parentComment: newComment._id,
      replies: []
    };

    blog.comments.push(testReply);
    await blog.save();

    console.log('✅ Reply added successfully!');

    // Test fetching comments
    console.log('\n🧪 Testing comment fetching...');
    const blogWithComments = await Blog.findById(blog._id)
      .populate({
        path: 'comments.author',
        select: 'firstName lastName image'
      })
      .populate({
        path: 'comments.replies.author',
        select: 'firstName lastName image'
      });

    const topLevelComments = blogWithComments.comments
      .filter(comment => !comment.parentComment)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('📊 Found', topLevelComments.length, 'top-level comments');
    console.log('📝 First comment:', {
      id: topLevelComments[0]._id,
      content: topLevelComments[0].content.substring(0, 50) + '...',
      author: topLevelComments[0].author.firstName + ' ' + topLevelComments[0].author.lastName,
      repliesCount: blogWithComments.comments.filter(reply =>
        reply.parentComment && reply.parentComment.toString() === topLevelComments[0]._id.toString()
      ).length
    });

    console.log('\n🎉 All tests passed! Embedded comments are working correctly.');

    process.exit();

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testComments();