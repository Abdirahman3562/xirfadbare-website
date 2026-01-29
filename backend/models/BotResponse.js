import mongoose from 'mongoose';

const botResponseSchema = mongoose.Schema(
    {
        trigger: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        response: {
            type: String,
            required: true
        },
        matchType: {
            type: String,
            enum: ['contains', 'exact'],
            default: 'contains'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const BotResponse = mongoose.model('BotResponse', botResponseSchema);
export default BotResponse;
