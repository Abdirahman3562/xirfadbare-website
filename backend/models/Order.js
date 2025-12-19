import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

    // Complete user information at time of order
    userDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      image: { type: String },
      role: { type: String, default: 'student' },
    },

    // Complete course information at time of order
    courseDetails: {
      title: { type: String, required: true },
      type: { type: String },
      description: { type: String },
      technology: { type: String },
      price: { type: Number, required: true },
      accessType: { type: String, default: 'Lifetime' },
      thumbnail: { type: String },
      level: { type: String },
      enrolledCount: { type: Number, default: 0 },
      instructor: {
        name: { type: String },
        instructorTitle: { type: String },
        image: { type: String },
        description: { type: String },
        contactEmail: { type: String },
        contactPhone: { type: String },
      },
      learningOutcomes: [String],
      isBestSeller: { type: Boolean, default: false },
      curriculum: [{
        title: { type: String },
        lessons: [{
          title: { type: String },
          duration: { type: String },
          videoUrl: { type: String },
        }],
      }],
    },

    // Legacy fields for backward compatibility
    userName: { type: String },
    userEmail: { type: String },
    courseTitle: { type: String },

    // Payment information
    paymentType: { type: String },
    paymentMethod: { type: String },
    phoneNumber: { type: String },
    totalToPay: { type: Number },
    discountApplied: { type: Number, default: 0 },
    finalPrice: { type: Number },

    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;


