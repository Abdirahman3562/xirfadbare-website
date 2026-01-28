import mongoose from 'mongoose';

const testimonialSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    tag: { type: String },
    image: { type: String },
    quote: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    isActive: { type: Boolean, default: false },
    order: { type: Number, default: 0 }, // For ordering testimonials
  },
  { timestamps: true }
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;



