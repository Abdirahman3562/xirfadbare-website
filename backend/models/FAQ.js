import mongoose from 'mongoose';

const faqSchema = mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'general' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // For ordering FAQs
    language: { type: String, default: 'so' }, // 'so' for Somali, 'en' for English
  },
  { timestamps: true }
);

const FAQ = mongoose.model('FAQ', faqSchema);
export default FAQ;


