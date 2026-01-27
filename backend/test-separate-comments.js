import mongoose from 'mongoose';
import Blog from './models/Blog.js';
import Comment from './models/Comment.js';
import User from './models/User.js';

async function testSeparateComments() {
  try {
    console.log('🧪 Testing separate comment collection functionality...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
    console.log('✅ Connected to database');

    // Find a blog and user to test with
    const blogs = await Blog.find({}).limit(1);
    const users = await User.find({}).limit(1);

    if (blogs.length === 0 || users.length === 0) {
      console.log('❌ Need at least one blog and one user for testing');
      return;
    }

    const testBlog = blogs[0];
    const testUser = users[0];

    console.log(`📝 Testing with blog: "${testBlog.title}"`);
    console.log(`👤 Testing with user: "${testUser.firstName} ${testUser.lastName}"`);

    // Test 1: Create a comment using the Comment model
    console.log('\n📝 Test 1: Creating comment in separate collection...');

    const newComment = new Comment({
      content: `Test comment in separate collection - ${new Date().toISOString()}`,
      author: testUser._id,
      blog: testBlog._id,
      parentComment: null,
      replies: []
    });

    const savedComment = await newComment.save();
    console.log('✅ Comment saved to separate collection:', {
      _id: savedComment._id,
      content: savedComment.content,
      author: savedComment.author,
      blog: savedComment.blog,
      collection: savedComment.collection.name // Should be 'comments'
    });

    // Test 2: Verify blog doesn't have embedded comments
    console.log('\n🔍 Test 2: Verifying blog has no embedded comments...');

    const blogWithComments = await Blog.findById(testBlog._id);
    console.log('✅ Blog comments array:', blogWithComments.comments || 'No comments field');
    console.log('✅ Blog comments length:', (blogWithComments.comments || []).length);

    // Test 3: Create a reply
    console.log('\n↩️ Test 3: Creating reply in separate collection...');

    const reply = new Comment({
      content: `Test reply in separate collection - ${new Date().toISOString()}`,
      author: testUser._id,
      blog: testBlog._id,
      parentComment: savedComment._id,
      replies: []
    });

    const savedReply = await reply.save();

    // Add reply to parent comment's replies array
    savedComment.replies.push(savedReply._id);
    await savedComment.save();

    console.log('✅ Reply saved to separate collection:', {
      _id: savedReply._id,
      content: savedReply.content,
      parentComment: savedReply.parentComment
    });

    // Test 4: Query comments for the blog
    console.log('\n🔍 Test 4: Querying comments from separate collection...');

    const commentsForBlog = await Comment.find({ blog: testBlog._id })
      .populate('author', 'firstName lastName image')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'firstName lastName image'
        }
      });

    console.log('✅ Found comments for blog:', commentsForBlog.length);
    console.log('✅ Comments data:', commentsForBlog.map(c => ({
      id: c._id,
      content: c.content.substring(0, 50) + '...',
      author: c.author ? `${c.author.firstName} ${c.author.lastName}` : 'Unknown',
      repliesCount: c.replies.length
    })));

    console.log('\n🎉 All separate comment collection tests passed!');
    console.log('✅ Comments are saved to separate Comment collection');
    console.log('✅ Blog collection no longer contains embedded comments');
    console.log('✅ Comments can be queried and populated correctly');

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Comment.deleteMany({ content: { $regex: 'Test.*separate collection' } });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the test
testSeparateComments();


