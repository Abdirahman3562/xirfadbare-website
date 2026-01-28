import mongoose from 'mongoose';

const authorSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  avatar: { type: String },
  bio: { type: String },
  verified: { type: Boolean, default: false },
  location: { type: String },
  website: { type: String },
  status: { type: String, default: 'active' },
  social: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' }
  }
}, { timestamps: true });

const Author = mongoose.model('Author', authorSchema);
export default Author;
