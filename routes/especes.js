const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const Espece = require('../models/Espece');

// Ajouter une espèce
router.post('/', async (req, res) => {
  try {
    const espece = new Espece(req.body);
    await espece.save();
    res.status(201);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Obtenir les espèces avec pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const especes = await Espece.find().skip(skip).limit(limit);
    const total = await Espece.countDocuments();

    res.status(200).json({
      data: especes,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modifier une espèce
router.put('/:id', async (req, res) => {
  try {
    const espece = await Espece.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!espece) return res.status(404).send({ message: 'Espèce non trouvée' });
    res.send({ message: 'Espèce modifiée avec succès', espece });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Supprimer une espèce
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Espece.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send({ message: 'Espèce non trouvée' });
    res.send({ message: 'Espèce supprimée avec succès' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Obtenir une espèce aléatoire
router.get('/random', async (req, res) => {
  try {
    const count = await Espece.countDocuments();
    if (count === 0) return res.status(404).json({ message: 'Aucune espèce trouvée' });

    const randomIndex = Math.floor(Math.random() * count);
    const randomEspece = await Espece.findOne().skip(randomIndex);

    res.status(200).json(randomEspece);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/all', async (req, res) => {
  try {
    const especes = await Espece.find({}, 'espece image').sort({ espece: 1 });
    res.json(especes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une espèce par son nom (pour la fiche détaillée)
router.get('/nom/:espece', async (req, res) => {
  try {
    const espece = await Espece.findOne({ espece: req.params.espece });
    if (!espece) return res.status(404).json({ message: 'Espèce non trouvée' });
    res.status(200).json(espece);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/classify', async (req, res) => {
  try {
    const { photo } = req.body;
    if (!photo) return res.status(400).json({ error: 'Image manquante.' });

    // Convertir base64 en fichier temporaire
    const matches = photo.match(/^data:image\/png;base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: 'Format base64 invalide' });

    const imageBuffer = Buffer.from(matches[1], 'base64');
    const filename = `${uuidv4()}.png`;
    const imagePath = path.join(__dirname, '../uploads', filename);

    fs.writeFileSync(imagePath, imageBuffer);

    // Appeler le script Python
    const pythonScript = path.join(__dirname, '../Model/test_model.py');
    exec(`python "${pythonScript}" "${imagePath}"`, async (error, stdout, stderr) => {
      fs.unlinkSync(imagePath); // Supprimer après traitement

      if (error) {
        console.error('Erreur Python :', stderr);
        return res.status(500).json({ error: 'Erreur script Python' });
      }

      try {
        const result = JSON.parse(stdout);
        const species = await Espece.findOne({ espece: result.predicted_species });

        if (species) {
          return res.json({ match: true, data: species });
        } else {
          return res.json({ match: false, predicted_species: result.predicted_species });
        }
      } catch (parseErr) {
        console.error('Erreur parsing JSON:', parseErr);
        return res.status(500).json({ error: 'Erreur analyse résultat Python' });
      }
    });

  } catch (err) {
    console.error('Erreur classification :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


module.exports = router;
