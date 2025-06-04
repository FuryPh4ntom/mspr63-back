const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const especesRoutes = require('./routes/especes'); 
const authRoutes = require('./routes/auth'); 
const scanRoutes = require('./routes/scans'); 
const dashRoutes = require('./routes/dashboard'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion MongoDB réussie'))
.catch(err => console.error('Erreur MongoDB :', err));

app.use('/api/especes', especesRoutes); 
app.use('/api/auth', authRoutes); 
app.use('/api/scans', scanRoutes); 
app.use('/api/dashboard', dashRoutes); 

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
