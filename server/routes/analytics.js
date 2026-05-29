const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getSummary, getCapital, updateCapital, getMonthlyReport } = require('../controllers/analyticsController');

router.use(authMiddleware);
router.get('/summary', getSummary);
router.get('/capital', getCapital);
router.post('/capital', updateCapital);
router.get('/monthly-report', getMonthlyReport);

module.exports = router;
