import mongoose from 'mongoose';

const paymentMethodSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    instruction: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['local', 'online'],
        default: 'local'
    },
    icon: {
        type: String, // String for icon name or URL
        default: 'CreditCard'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;
