import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, default: null },
  replies: [{ type: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

const blogSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    date: { type: String },
    thumbnail: { type: String },
    content: { type: String, required: true },
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;



