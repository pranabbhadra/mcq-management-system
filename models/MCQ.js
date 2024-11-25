const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// MCQ Schema
const MCQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Option' }],
  correctAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'CorrectAnswer' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});


const MCQ = mongoose.model('MCQ', MCQSchema);

module.exports = MCQ;
