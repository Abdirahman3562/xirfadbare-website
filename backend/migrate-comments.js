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

async function migrateComments() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/samafale_academy');
    console.log('✅ Connected to database');

    // Get all existing comments
    const existingComments = await Comment.find({})
      .populate('author', 'firstName lastName image')
      .populate('blog', '_id title')
      .sort({ createdAt: 1 });

    console.log(`📊 Found ${existingComments.length} existing comments to migrate`);

    // Debug: Check first comment structure
    if (existingComments.length > 0) {
      console.log('🔍 Sample comment structure:', {
        _id: existingComments[0]._id,
        content: existingComments[0].content?.substring(0, 50),
        blog: existingComments[0].blog,
        author: existingComments[0].author,
        parentComment: existingComments[0].parentComment,
        replies: existingComments[0].replies
      });
    }

    if (existingComments.length === 0) {
      console.log('ℹ️ No comments to migrate');
      return;
    }

    // Group comments by blog
    const commentsByBlog = {};
    existingComments.forEach(comment => {
      if (!comment.blog) {
        console.log(`⚠️ Comment ${comment._id} has no blog reference, skipping...`);
        return;
      }
      const blogId = comment.blog.toString();
      if (!commentsByBlog[blogId]) {
        commentsByBlog[blogId] = [];
      }
      commentsByBlog[blogId].push(comment);
    });

    // Migrate comments for each blog
    for (const [blogId, comments] of Object.entries(commentsByBlog)) {
      console.log(`🔄 Migrating ${comments.length} comments for blog ${blogId}`);

      const blog = await Blog.findById(blogId);
      if (!blog) {
        console.log(`❌ Blog ${blogId} not found, skipping...`);
        continue;
      }

      // Convert comments to embedded format
      const embeddedComments = [];

      // First, add all top-level comments
      const topLevelComments = comments.filter(c => !c.parentComment);

      for (const topLevelComment of topLevelComments) {
        const embeddedComment = {
          _id: topLevelComment._id,
          content: topLevelComment.content,
          author: topLevelComment.author._id,
          parentComment: null,
          replies: [],
          createdAt: topLevelComment.createdAt,
          updatedAt: topLevelComment.updatedAt
        };

        // Add replies to this comment
        const replies = comments.filter(c => c.parentComment && c.parentComment.toString() === topLevelComment._id.toString());

        embeddedComment.replies = replies.map(reply => ({
          content: reply.content,
          author: reply.author._id,
          createdAt: reply.createdAt
        }));

        embeddedComments.push(embeddedComment);
      }

      // Update the blog with embedded comments
      blog.comments = embeddedComments;
      await blog.save();

      console.log(`✅ Migrated ${embeddedComments.length} comments for blog "${blog.title}"`);
    }

    // Count total migrated comments
    const totalEmbeddedComments = await Blog.aggregate([
      { $unwind: '$comments' },
      { $count: 'total' }
    ]);

    console.log(`🎉 Migration complete! Total embedded comments: ${totalEmbeddedComments[0]?.total || 0}`);

    // Optional: Drop the old Comment collection
    const shouldDropCollection = process.argv.includes('--drop-old');
    if (shouldDropCollection) {
      await mongoose.connection.db.dropCollection('comments');
      console.log('🗑️ Dropped old comments collection');
    } else {
      console.log('ℹ️ Old comments collection preserved. Run with --drop-old to remove it.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
}

// Run the migration
migrateComments();
