import BotResponse from '../models/BotResponse.js';

// @desc    Get all bot responses
// @route   GET /api/bot-responses
// @access  Public (for widget) / Private (for admin management) --> We can make it public for now or protected
export const getBotResponses = async (req, res) => {
    try {
        const responses = await BotResponse.find({}).sort({ createdAt: -1 });
        res.status(200).json(responses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new bot response
// @route   POST /api/bot-responses
// @access  Private/Admin
export const createBotResponse = async (req, res) => {
    try {
        const { trigger, response, matchType } = req.body;

        if (!trigger || !response) {
            return res.status(400).json({ message: "Trigger and Response are required" });
        }

        const newResponse = new BotResponse({
            trigger,
            response,
            matchType
        });

        const savedResponse = await newResponse.save();
        res.status(201).json(savedResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a bot response
// @route   PUT /api/bot-responses/:id
// @access  Private/Admin
export const updateBotResponse = async (req, res) => {
    try {
        const { trigger, response, matchType, isActive } = req.body;
        const botResponse = await BotResponse.findById(req.params.id);

        if (botResponse) {
            botResponse.trigger = trigger || botResponse.trigger;
            botResponse.response = response || botResponse.response;
            botResponse.matchType = matchType || botResponse.matchType;
            if (isActive !== undefined) botResponse.isActive = isActive;

            const updatedResponse = await botResponse.save();
            res.json(updatedResponse);
        } else {
            res.status(404).json({ message: 'Response not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a bot response
// @route   DELETE /api/bot-responses/:id
// @access  Private/Admin
export const deleteBotResponse = async (req, res) => {
    try {
        const botResponse = await BotResponse.findById(req.params.id);

        if (botResponse) {
            await botResponse.deleteOne();
            res.json({ message: 'Response removed' });
        } else {
            res.status(404).json({ message: 'Response not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
