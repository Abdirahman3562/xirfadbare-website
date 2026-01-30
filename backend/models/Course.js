import mongoose from 'mongoose';

const lessonSchema = mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String },
  videoUrl: { type: String },
  curriculumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' },
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
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;





