import mongoose from 'mongoose';

const resourceSchema = mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String } // e.g., 'zip', 'pdf'
}, { _id: false });

const lessonSchema = mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'quiz', 'hybrid'], default: 'video' },
  duration: { type: String },
  quizDuration: { type: Number, default: 10 },
  videoUrl: { type: String },
  quizQuestions: [{
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'], default: 'multiple-choice' },
    options: [String],
    correctAnswer: { type: mongoose.Schema.Types.Mixed },
    explanation: { type: String }
  }],
  curriculumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' },
  lessonResources: [resourceSchema]
});

const curriculumSchema = mongoose.Schema({
  title: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  lessons: [lessonSchema],
});

const courseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String },
    description: { type: String },
    technology: { type: String },
    price: { type: Number, required: true },
    accessType: { type: String, default: 'Lifetime' },
    thumbnail: { type: String },
    level: { type: String },
    enrolledCount: { type: Number, default: 0 },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
    communityLink: { type: String },
    learningOutcomes: [String],
    isBestSeller: { type: Boolean, default: false },
    discountCode: { type: String },
    discountPercentage: { type: Number, default: 0 },
    discountExpiry: { type: Date },
    hasCertificate: { type: Boolean, default: false },
    certificateTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateTemplate' },
    curriculum: [curriculumSchema],
    courseResources: [resourceSchema],
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;





