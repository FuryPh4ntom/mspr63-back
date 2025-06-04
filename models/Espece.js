const mongoose = require('mongoose');

const especeSchema = new mongoose.Schema({
  espece: { type: String, required: true },
  description: { type: String, required: true },
  nomLatin: { type: String, required: true },
  famille: { type: String, required: true },
  taille: { type: String, required: true },
  region: { type: String, required: true },
  habitat: { type: String, required: true },
  funFact: { type: String, required: true },
  image: { type: String } // Champ pour image base64
});

module.exports = mongoose.model('Espece', especeSchema);
