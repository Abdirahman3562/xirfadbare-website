import mongoose from 'mongoose';

const systemSettingSchema = mongoose.Schema({
    hero: {
        title: { type: String, default: 'Become a Full-Stack Engineer the smart way' },
        subtitle: { type: String, default: 'Hands-on projects, mentor feedback, and job-ready skills.' },
        description: { type: String, default: '' }
    },
    stats: {
        learners: { type: String, default: '10,000+' },
        courses: { type: String, default: '200+' },
        rating: { type: String, default: '4.9★' },
        partners: { type: String, default: '50+' }
    },
    howItWorks: [
        {
            step: { type: Number },
            title: { type: String },
            description: { type: String }
        }
    ],
    studentOutcomes: [
        {
            value: { type: String },
            label: { type: String }
        }
    ],
    about: {
        badge: { type: String, default: '#1 Somali Coding Platform' },
        title: { type: String, default: 'Building Real Opportunities for Somalis Through Tech' },
        description: { type: String, default: 'Xirfadbare gives Somali youth and diaspora a clear, structured path to learn coding and AI — in their own language.' },
        founder: {
            name: { type: String, default: 'Abdirahman Mohamed' },
            role: { type: String, default: 'Founder & CEO' },
            bio: { type: String, default: '' },
            image: { type: String, default: '' }
        }
    },
    contact: {
        email: { type: String, default: 'info@samafale.com' },
        phone: { type: String, default: '+252 61XXXXXXX' },
        address: { type: String, default: 'Mogadishu, Somalia' },
        workingHours: { type: String, default: 'Sat - Thu: 8:00 AM - 5:00 PM' }
    }
}, { timestamps: true });

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
