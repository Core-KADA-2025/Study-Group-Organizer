//import
const mongoose = require('mongoose');
const {Schema} = mongoose;

//buat shema
const groupSchema = new Schema({
    name:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,
    },
    members :  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
},{
    timestamps:true,
})

//buat model
module.exports = new mongoose.model('Group',groupSchema)