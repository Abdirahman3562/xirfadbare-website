import mongoose from 'mongoose';

const chatSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Can be guest (if we allow guests later, but user implies logged in preferred)
        },
        sender: {
            type: String,
            enum: ['user', 'admin', 'bot'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        // For guest users, we might need a session ID, but for now let's assume valid users or handle guest logic in controller
        guestId: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
