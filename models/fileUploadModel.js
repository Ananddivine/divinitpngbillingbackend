const mongoose = require('mongoose');


const fileUploadSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  attachments: [{ type: String }], // URLs to attachments
 
}, { timestamps: true });

const file = mongoose.model('file', fileUploadSchema);
module.exports = file;

module.exports = mongoose.model('file', fileUploadSchema);


  