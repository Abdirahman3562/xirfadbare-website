import mongoose from 'mongoose';
import Blog from './models/Blog.js';
import User from './models/User.js'; // Import User model to register it

async function testAPIEmbeddedComments() {
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
    console.log(`📝 Testing embedded comments API with blog: "${testBlog.title}"`);
    console.log(`📊 Blog ID: ${testBlog._id}`);

    // Test 1: Get comments for the blog
    console.log('\n🔍 Test 1: Getting comments for blog...');
    const blogWithComments = await Blog.findById(testBlog._id)
      .populate('comments.author', 'firstName lastName image')
      .populate('comments.replies.author', 'firstName lastName image');

    console.log(`📊 Found ${blogWithComments.comments.length} top-level comments`);

    // Show comment details
    blogWithComments.comments.forEach((comment, index) => {
      console.log(`  Comment ${index + 1}:`, {
        id: comment._id,
        content: comment.content || 'No content',
        author: comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'No author',
        replies: comment.replies?.length || 0
      });
    });

    // Test 2: Simulate adding a comment (what the API would do)
    console.log('\n🔍 Test 2: Simulating comment addition...');

    const newComment = {
      content: `API Test Comment - ${new Date().toLocaleString()}`,
      author: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Mock user ID
      parentComment: null,
      replies: []
    };

    testBlog.comments.push(newComment);
    await testBlog.save();

    console.log('✅ Comment added via API simulation');
    console.log(`📊 New total comments: ${testBlog.comments.length}`);

    // Test 3: Simulate adding a reply
    console.log('\n🔍 Test 3: Simulating reply addition...');

    if (testBlog.comments.length > 0) {
      const latestComment = testBlog.comments[testBlog.comments.length - 1];

      const newReply = {
        content: `API Test Reply - ${new Date().toLocaleString()}`,
        author: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), // Different mock user ID
        createdAt: new Date()
      };

      latestComment.replies.push(newReply);
      await testBlog.save();

      console.log('✅ Reply added via API simulation');
      console.log(`📊 Replies for comment: ${latestComment.replies.length}`);
    }

    console.log('\n🎉 Embedded comments API simulation completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
}

// Run the test
testAPIEmbeddedComments();
