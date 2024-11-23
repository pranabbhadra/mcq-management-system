const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// MCQ Schema
const mcqSchema = new Schema({
  question: { type: String, required: true },
  options: [String],
  correctAnswer: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to User
}, { timestamps: true });

const MCQ = mongoose.model('MCQ', mcqSchema);

module.exports = MCQ;
