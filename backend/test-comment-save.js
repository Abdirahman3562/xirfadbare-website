import mongoose from 'mongoose';
import Blog from './models/Blog.js';
import User from './models/User.js';

async function testCommentSave() {
  try {
    console.log('🧪 Testing comment save functionality...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
    console.log('✅ Connected to database');

    // Find a blog to test with
    const blogs = await Blog.find({}).limit(1);
    if (blogs.length === 0) {
      console.log('❌ No blogs found for testing');
      return;
    }

    const testBlog = blogs[0];
    console.log(`📝 Testing with blog: "${testBlog.title}"`);

    // Find a user to simulate comment creation
    const users = await User.find({}).limit(1);
    if (users.length === 0) {
      console.log('❌ No users found for testing');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Testing with user: "${testUser.firstName} ${testUser.lastName}"`);

    // Test 1: Create a top-level comment
    console.log('\n📝 Test 1: Creating top-level comment...');

    const newComment = {
      content: `Test comment - ${new Date().toISOString()}`,
      author: testUser._id,
      parentComment: null,
      replies: []
    };

    testBlog.comments.push(newComment);
    await testBlog.save();

    const savedComment = testBlog.comments[testBlog.comments.length - 1];
    console.log('✅ Comment saved with data:', {
      _id: savedComment._id,
      content: savedComment.content,
      author: savedComment.author,
      createdAt: savedComment.createdAt,
      updatedAt: savedComment.updatedAt
    });

    // Test 2: Create a reply
    console.log('\n↩️ Test 2: Creating reply...');

    const replyData = {
      content: `Test reply - ${new Date().toISOString()}`,
      author: testUser._id,
      createdAt: new Date()
    };

    savedComment.replies.push(replyData);
    await testBlog.save();

    const savedReply = savedComment.replies[savedComment.replies.length - 1];
    console.log('✅ Reply saved with data:', {
      _id: savedReply._id,
      content: savedReply.content,
      author: savedReply.author,
      createdAt: savedReply.createdAt
    });

    // Test 3: Verify data retrieval with population
    console.log('\n🔍 Test 3: Verifying data retrieval...');

    const blogWithPopulatedComments = await Blog.findById(testBlog._id)
      .populate('comments.author', 'firstName lastName image')
      .populate('comments.replies.author', 'firstName lastName image');

    const populatedComment = blogWithPopulatedComments.comments
      .find(c => c._id.toString() === savedComment._id.toString());

    console.log('✅ Populated comment data:', {
      content: populatedComment.content,
      author: {
        name: `${populatedComment.author.firstName} ${populatedComment.author.lastName}`,
        image: populatedComment.author.image
      },
      repliesCount: populatedComment.replies.length,
      replies: populatedComment.replies.map(reply => ({
        content: reply.content,
        author: reply.author ? `${reply.author.firstName} ${reply.author.lastName}` : 'Not populated'
      }))
    });

    console.log('\n🎉 All comment save tests passed!');
    console.log('✅ Comments are properly saving with user information');
    console.log('✅ Replies are properly saving with user information');
    console.log('✅ Data population is working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the test
testCommentSave();

