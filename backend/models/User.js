import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    image: { type: String },
    role: { type: String, enum: ['student', 'admin', 'author', 'teacher'], default: 'student' },
    isActive: { type: Boolean, default: true },
    is2FAEnabled: { type: Boolean, default: false },
    isChatPausedByAdmin: { type: Boolean, default: false },
    twoFactorCode: { type: String },
    twoFactorExpires: { type: Date },
    // Author Profile Fields
    username: { type: String, unique: true, sparse: true }, // sparse allows null/undefined to be non-unique
    bio: { type: String },
    location: { type: String },
    website: { type: String },
    verified: { type: Boolean, default: false },
    social: {
      github: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      youtube: { type: String },
      facebook: { type: String },
      instagram: { type: String }
    }
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

const User = mongoose.model('User', userSchema);
export default User;



