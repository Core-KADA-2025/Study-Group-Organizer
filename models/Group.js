const mongoose = require('mongoose');
const {Schema} = mongoose;

const groupSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true, 
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
},{
    timestamps: true,
})

module.exports = mongoose.model('Group', groupSchema); 

