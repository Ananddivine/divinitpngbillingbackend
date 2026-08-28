const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model
  username: { type: String }, // Store username directly
  attachments: [{ type: String }], // URLs to attachments
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the User model for replies
    username: { type: String },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);
module.exports = Issue;

module.exports = mongoose.model('Issue', issueSchema);
