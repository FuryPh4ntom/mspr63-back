const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const User = require('../models/User');
const moment = require('moment');

// Statistiques globales
router.get('/stats', async (req, res) => {
  const today = moment().startOf('day');
  const startOfWeek = moment().startOf('week');
  const startOfMonth = moment().startOf('month');
  const startOfYear = moment().startOf('year');

  const [todayCount, weekCount, monthCount, yearCount, userCount] = await Promise.all([
    Scan.countDocuments({ date: { $gte: today.toDate() } }),
    Scan.countDocuments({ date: { $gte: startOfWeek.toDate() } }),
    Scan.countDocuments({ date: { $gte: startOfMonth.toDate() } }),
    Scan.countDocuments({ date: { $gte: startOfYear.toDate() } }),
    User.countDocuments()
  ]);

  res.json({
    today: todayCount,
    week: weekCount,
    month: monthCount,
    year: yearCount,
    users: userCount
  });
});

// Répartition par espèce
router.get('/species-distribution', async (req, res) => {
  const aggregation = await Scan.aggregate([
    { $group: { _id: '$especeDetectee', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const labels = aggregation.map(item => item._id);
  const counts = aggregation.map(item => item.count);

  res.json({ labels, counts });
});

module.exports = router;
