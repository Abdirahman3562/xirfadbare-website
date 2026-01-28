import mongoose from 'mongoose';

const settingsSchema = mongoose.Schema(
    {
        websiteTitle: {
            type: String,
            default: 'Xirfadbare Academy | Learn & Grow'
        },
        websiteDescription: {
            type: String,
            default: 'Empowering Somali learners with accessible, high-quality education in Af-Soomaali.'
        },
        contactEmail: {
            type: String,
            default: 'info@xirfadbare.com'
        },
        whatsappLink: {
            type: String,
            default: ''
        },
        phoneNumber: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: 'Mogadishu, Somalia'
        },
        logo: {
            type: String,
            default: ''
        },
        facebookLink: {
            type: String,
            default: ''
        },
        twitterLink: {
            type: String,
            default: ''
        },
        linkedinLink: {
            type: String,
            default: ''
        },
        instagramLink: {
            type: String,
            default: ''
        },
        tiktokLink: {
            type: String,
            default: ''
        },
        youtubeLink: {
            type: String,
            default: ''
        },
    },
    { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
