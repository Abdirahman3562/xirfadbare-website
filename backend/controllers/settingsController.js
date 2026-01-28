import Settings from '../models/Settings.js';

// @desc    Get website settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
    try {
        // Get the first (and should be only) settings document
        let settings = await Settings.findOne();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await Settings.create({});
        }

        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update website settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    try {
        const {
            websiteTitle,
            websiteDescription,
            contactEmail,
            whatsappLink,
            phoneNumber,
            location,
            logo,
            facebookLink,
            twitterLink,
            linkedinLink,
            instagramLink,
            tiktokLink,
            youtubeLink
        } = req.body;

        // Get existing settings or create new
        let settings = await Settings.findOne();

        if (!settings) {
            // Create new settings
            settings = await Settings.create({
                websiteTitle,
                websiteDescription,
                contactEmail,
                whatsappLink,
                phoneNumber,
                location,
                logo,
                facebookLink,
                twitterLink,
                linkedinLink,
                instagramLink,
                tiktokLink,
                youtubeLink
            });
        } else {
            // Update existing settings
            settings.websiteTitle = websiteTitle || settings.websiteTitle;
            settings.websiteDescription = websiteDescription || settings.websiteDescription;
            settings.contactEmail = contactEmail || settings.contactEmail;
            settings.whatsappLink = whatsappLink || settings.whatsappLink;
            settings.phoneNumber = phoneNumber || settings.phoneNumber;
            settings.location = location || settings.location;
            settings.logo = logo || settings.logo;
            settings.facebookLink = facebookLink || settings.facebookLink;
            settings.twitterLink = twitterLink || settings.twitterLink;
            settings.linkedinLink = linkedinLink || settings.linkedinLink;
            settings.instagramLink = instagramLink || settings.instagramLink;
            settings.tiktokLink = tiktokLink || settings.tiktokLink;
            settings.youtubeLink = youtubeLink || settings.youtubeLink;

            await settings.save();
        }

        res.json({
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
