const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  replies: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
