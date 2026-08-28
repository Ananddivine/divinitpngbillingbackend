const mongoose = require('mongoose');

const UserAuthSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  uniqToken: { type: String, required: true }, // Store the unique token
});

module.exports = mongoose.model('UserAuth', UserAuthSchema);
