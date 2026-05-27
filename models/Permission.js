import mongoose from "mongoose"

const permissionSchema = new mongoose.Schema({
    resource: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ['create', 'read', 'update', 'delete'],
        required: true
    },
    description: String,
})

const permissionModel = mongoose.model('Permission', permissionSchema);
export default permissionModel;