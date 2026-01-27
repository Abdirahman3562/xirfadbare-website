import mongoose from 'mongoose';

const instructorSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    instructorTitle: { type: String },
    description: { type: String },
    about: { type: String }, // Keeping about for compatibility if needed, but description is the main one now
    followers: { type: Number, default: 0 },
    followersList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reviews: [
      {
        courseId: { type: String },
        student: { type: String },
        image: { type: String },
        rating: { type: Number, default: 0 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    coverImage: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    students: { type: Number, default: 0 },
    image: { type: String },
  },
  { timestamps: true }
);

const Instructor = mongoose.model('Instructor', instructorSchema);
export default Instructor;





