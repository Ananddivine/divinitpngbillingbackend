const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The user who will receive the notification
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }, // The issue being replied to
  reply: { type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }, // The reply to the issue
  message: String, // Notification message, e.g., "Someone has replied to your issue"
  isRead: { type: Boolean, default: false }, // Whether the notification is read or not
  createdAt: { type: Date, default: Date.now }, // When the notification was created
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
