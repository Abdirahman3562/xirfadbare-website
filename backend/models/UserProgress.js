import mongoose from 'mongoose';

const userProgressSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: String }], // Array of lesson titles or IDs
    currentLesson: { type: String },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    lastAccess: { type: Date, default: Date.now },
    completedAt: { type: Date },
    certificateId: { type: String },
    timeSpent: { type: Number, default: 0 }, // Time spent in minutes
    quizResults: [
      {
        lessonId: { type: String, required: true },
        score: { type: Number, required: true },
        totalQuestions: { type: Number, required: true },
        completedAt: { type: Date, default: Date.now }
      }
    ],
  },
  { timestamps: true }
);

// Compound index to ensure one progress record per user-course combination
userProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
export default UserProgress;



