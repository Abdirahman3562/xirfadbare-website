import mongoose from 'mongoose';

const roleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String,
            required: false,
            trim: true
        },
        permissions: [
            {
                type: String,
                trim: true
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Role = mongoose.model('Role', roleSchema);

export default Role;
