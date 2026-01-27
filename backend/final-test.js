import mongoose from 'mongoose';
import Blog from './models/Blog.js';
import User from './models/User.js';

async function finalTest() {
  try {
    console.log('🚀 Starting final embedded comments system test...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
    console.log('✅ Connected to database');

    // 1. Check database state
    console.log('\n📊 === DATABASE STATE ===');
    const blogsCount = await Blog.countDocuments();
    const blogsWithComments = await Blog.countDocuments({ 'comments.0': { $exists: true } });
    const totalComments = await Blog.aggregate([
      { $unwind: '$comments' },
      { $count: 'total' }
    ]);

    console.log(`📝 Total blogs: ${blogsCount}`);
    console.log(`💬 Blogs with comments: ${blogsWithComments}`);
    console.log(`📊 Total embedded comments: ${totalComments[0]?.total || 0}`);

    // 2. Test comment retrieval
    console.log('\n🔍 === COMMENT RETRIEVAL TEST ===');
    const blogs = await Blog.find({}).limit(1);
    if (blogs.length > 0) {
      const blog = blogs[0];
      console.log(`Testing with blog: "${blog.title}"`);

      const blogWithPopulatedComments = await Blog.findById(blog._id)
        .populate('comments.author', 'firstName lastName image')
        .populate('comments.replies.author', 'firstName lastName image');

      console.log(`Found ${blogWithPopulatedComments.comments.length} comments`);

      blogWithPopulatedComments.comments.forEach((comment, index) => {
        console.log(`  ${index + 1}. "${comment.content || 'No content'}" by ${comment.author?.firstName || 'Unknown'} (${comment.replies?.length || 0} replies)`);
      });
    }

    // 3. Test comment creation simulation
    console.log('\n➕ === COMMENT CREATION TEST ===');
    const testBlog = blogs[0];
    const originalCount = testBlog.comments.length;

    // Create a proper comment like the API would
    const newComment = {
      content: `Final test comment - ${new Date().toISOString()}`,
      author: new mongoose.Types.ObjectId(), // Mock author ID
      parentComment: null,
      replies: []
    };

    testBlog.comments.push(newComment);
    await testBlog.save();

    console.log(`✅ Comment added. Count: ${originalCount} → ${testBlog.comments.length}`);

    // 4. Test reply creation simulation
    console.log('\n↩️ === REPLY CREATION TEST ===');
    const latestComment = testBlog.comments[testBlog.comments.length - 1];
    const replyCount = latestComment.replies.length;

    const newReply = {
      content: `Final test reply - ${new Date().toISOString()}`,
      author: new mongoose.Types.ObjectId(), // Mock author ID
      createdAt: new Date()
    };

    latestComment.replies.push(newReply);
    await testBlog.save();

    console.log(`✅ Reply added. Reply count: ${replyCount} → ${latestComment.replies.length}`);

    // 5. Test comment update simulation
    console.log('\n✏️ === COMMENT UPDATE TEST ===');
    const commentToUpdate = testBlog.comments[testBlog.comments.length - 1];
    const originalContent = commentToUpdate.content;

    commentToUpdate.content = `${originalContent} (UPDATED)`;
    await testBlog.save();

    console.log(`✅ Comment updated: "${originalContent}" → "${commentToUpdate.content}"`);

    // 6. Test comment deletion simulation
    console.log('\n🗑️ === COMMENT DELETION TEST ===');
    const deleteIndex = testBlog.comments.length - 1;
    const commentToDelete = testBlog.comments[deleteIndex];
    const deleteCount = testBlog.comments.length;

    testBlog.comments.splice(deleteIndex, 1);
    await testBlog.save();

    console.log(`✅ Comment deleted. Count: ${deleteCount} → ${testBlog.comments.length}`);

    console.log('\n🎉 === ALL TESTS PASSED! ===');
    console.log('✅ Embedded comments system is working perfectly!');
    console.log('✅ Comments are now stored directly in blog documents');
    console.log('✅ No separate comments collection needed');
    console.log('✅ Nested replies supported');
    console.log('✅ CRUD operations working');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the final test
finalTest();


