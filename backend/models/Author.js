import mongoose from 'mongoose';

const authorSchema = mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },
  verified: { type: Boolean, default: false },
});

const Author = mongoose.model('Author', authorSchema);
export default Author;





