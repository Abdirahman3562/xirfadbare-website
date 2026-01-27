import mongoose from 'mongoose';
import Blog from './models/Blog.js';

async function testEmbeddedComments() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
    console.log('✅ Connected to database');

    // Find a blog to test with
    const blogs = await Blog.find({}).limit(1);
    if (blogs.length === 0) {
      console.log('❌ No blogs found in database');
      return;
    }

    const testBlog = blogs[0];
    console.log(`📝 Testing with blog: "${testBlog.title}" (ID: ${testBlog._id})`);

    // Check current comments
    const initialCommentCount = testBlog.comments?.length || 0;
    console.log(`📊 Initial comment count: ${initialCommentCount}`);

    // Create a test embedded comment
    const testComment = {
      content: `Embedded test comment - ${new Date().toLocaleString()}`,
      author: new mongoose.Types.ObjectId(), // Mock user ID
      parentComment: null,
      replies: []
    };

    // Add comment to blog
    testBlog.comments.push(testComment);
    await testBlog.save();

    console.log(`✅ Embedded comment added successfully`);
    console.log(`📊 New comment count: ${testBlog.comments.length}`);
    console.log(`📝 Comment details:`, {
      content: testComment.content.substring(0, 50) + '...',
      author: testComment.author,
      createdAt: testComment.createdAt || new Date()
    });

    // Test adding a reply
    if (testBlog.comments.length > 0) {
      const parentComment = testBlog.comments[testBlog.comments.length - 1];
      const testReply = {
        content: `Embedded test reply - ${new Date().toLocaleString()}`,
        author: new mongoose.Types.ObjectId(), // Mock user ID
        createdAt: new Date()
      };

      parentComment.replies.push(testReply);
      await testBlog.save();

      console.log(`✅ Embedded reply added successfully`);
      console.log(`📊 Reply count for parent comment: ${parentComment.replies.length}`);
    }

    console.log('🎉 Embedded comments functionality is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
}

// Run the test
testEmbeddedComments();


