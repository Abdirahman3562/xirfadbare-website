import mongoose from 'mongoose';

const instructorSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    instructorTitle: { type: String },
    description: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    students: { type: Number, default: 0 },
    image: { type: String },
  },
  { timestamps: true }
);

const Instructor = mongoose.model('Instructor', instructorSchema);
export default Instructor;




