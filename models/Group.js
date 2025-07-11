// study-group-backend/models/Group.js
const mongoose = require('mongoose');
const {Schema} = mongoose;

// Fixed schema with correct 'required' property
const groupSchema = new Schema({
    name:{
        type: String,
        required: true, // Fixed: was 'require'
    },
    description:{
        type: String,
        required: true, // Fixed: was 'require'
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
},{
    timestamps: true,
})

// Fixed model export
module.exports = mongoose.model('Group', groupSchema); // Fixed: removed 'new'

