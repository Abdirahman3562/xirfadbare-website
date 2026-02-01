import mongoose from 'mongoose';

const bundleSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        thumbnail: { type: String },
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
                required: true
            }
        ],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Bundle = mongoose.model('Bundle', bundleSchema);
export default Bundle;
