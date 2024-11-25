const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  mcq: { type: mongoose.Schema.Types.ObjectId, ref: 'MCQ' },
});

module.exports = mongoose.model('Option', OptionSchema);
