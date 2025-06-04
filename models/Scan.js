const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  photo: { type: String, required: true },
  especeDetectee: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);
