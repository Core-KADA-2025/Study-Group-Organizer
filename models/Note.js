const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);