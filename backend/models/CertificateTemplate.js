import mongoose from 'mongoose';

const certificateTemplateSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'Default Certificate',
    },
    backgroundUrl: {
        type: String,
        required: true,
        default: 'https://placehold.co/842x595/png?text=Certificate+Background',
    },
    canvasWidth: {
        type: Number,
        default: 842,
    },
    canvasHeight: {
        type: Number,
        default: 595,
    },
    layout: [{
        id: { type: String, required: true },
        type: { type: String, required: true, enum: ['text', 'image', 'variable'] },
        label: { type: String },
        field: { type: String },
        content: { type: String },
        src: { type: String },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        width: { type: Number },
        height: { type: Number },
        fontSize: { type: Number, default: 16 },
        fontFamily: { type: String, default: 'Helvetica' },
        color: { type: String, default: '#000000' },
        textAlign: { type: String, default: 'left' },
        fontWeight: { type: String, default: 'normal' },
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

const CertificateTemplate = mongoose.model('CertificateTemplate', certificateTemplateSchema);
export default CertificateTemplate;
