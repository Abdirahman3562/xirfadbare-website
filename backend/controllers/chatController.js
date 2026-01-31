// Chat Controller

import Chat from '../models/Chat.js';
import User from '../models/User.js';

// @desc    Get chat history for a user
// @route   GET /api/chat
// @access  Private (or Public with guestId)
const getChatHistory = async (req, res) => {
    try {
        const history = await Chat.find({ user: req.user._id })
            .populate('admin', 'firstName lastName image')
            .sort({ createdAt: 1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { message, sender } = req.body;
        // sender should be 'user' normally if coming from this endpoint, but maybe admin replies use a different one?
        // Let's assume this endpoint is for the USER sending messages.

        const newChat = new Chat({
            user: req.user._id,
            sender: 'user',
            message,
        });

        const savedChat = await newChat.save();
        res.status(201).json(savedChat);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc save bot message
const saveBotMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const newChat = new Chat({
            user: req.user._id,
            sender: 'bot',
            message
        });
        const savedChat = await newChat.save();
        res.status(201).json(savedChat);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}


// @desc    Get all conversations (Admin)
// @route   GET /api/chat/conversations
// @access  Private/Admin
const getConversations = async (req, res) => {
    try {
        const conversations = await Chat.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$user",
                    lastMessage: { $first: "$message" },
                    sender: { $first: "$sender" },
                    lastMessageTime: { $first: "$createdAt" },
                    // Count unread messages from USER only
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$read", false] }, { $eq: ["$sender", "user"] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: "$userDetails" }, // Only include existing users
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    sender: 1,
                    lastMessageTime: 1,
                    unreadCount: 1,
                    user: {
                        _id: "$_id",
                        firstName: "$userDetails.firstName",
                        lastName: "$userDetails.lastName",
                        email: "$userDetails.email",
                        image: "$userDetails.image",
                        isChatPausedByAdmin: "$userDetails.isChatPausedByAdmin"
                    }
                }
            },
            { $sort: { lastMessageTime: -1 } }
        ]);

        res.json(conversations);
    } catch (error) {
        console.error("Aggregation Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get messages for a specific user (Admin)
// @route   GET /api/chat/admin/:userId
// @access  Private/Admin
const getMessagesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Chat.find({ user: userId })
            .populate('admin', 'firstName lastName image')
            .sort({ createdAt: 1 });

        // Mark as read when admin opens user chat (specific to user messages)
        await Chat.updateMany(
            { user: userId, sender: 'user', read: false },
            { $set: { read: true } }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send a message as Admin
// @route   POST /api/chat/admin
// @access  Private/Admin
const sendAdminMessage = async (req, res) => {
    try {
        const { userId, message } = req.body;

        const chat = new Chat({
            user: userId,
            sender: 'admin',
            admin: req.user._id,
            message,
            read: true
        });

        const savedChat = await chat.save();
        res.status(201).json(savedChat);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Take over a chat (Disable Bot)
// @route   PUT /api/chat/take-over/:userId
// @access  Private/Admin
const takeOverChat = async (req, res) => {
    try {
        const { userId } = req.params;
        const { pause } = req.body; // true to pause bot, false to resume

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isChatPausedByAdmin = pause;
        await user.save();

        // Optional: Send a system message
        const systemMsg = new Chat({
            user: userId,
            sender: 'bot',
            message: pause ? "Human Agent has joined the chat. Bot responses are paused." : "Human Agent has left. Bot responses are resumed."
        });
        await systemMsg.save();

        res.json({ message: "Chat status updated", isChatPausedByAdmin: user.isChatPausedByAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get total unread messages count for Admin
// @route   GET /api/chat/unread-count
// @access  Private/Admin
const getTotalUnreadMessages = async (req, res) => {
    try {
        const count = await Chat.countDocuments({ sender: 'user', read: false });

        const latestChat = await Chat.findOne({ sender: 'user', read: false })
            .sort({ createdAt: -1 })
            .populate('user', 'firstName lastName image');

        let latestMessage = null;
        if (latestChat && latestChat.user) {
            latestMessage = {
                content: latestChat.message,
                createdAt: latestChat.createdAt,
                sender: {
                    firstName: latestChat.user.firstName,
                    lastName: latestChat.user.lastName,
                    image: latestChat.user.image
                }
            };
        }

        res.json({ count, latestMessage });
    } catch (error) {
        console.error("Error fetching unread messages:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getChatHistory, sendMessage, saveBotMessage, getConversations, getMessagesByUser, sendAdminMessage, takeOverChat, getTotalUnreadMessages };
