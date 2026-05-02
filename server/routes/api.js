const express = require('express');
const router = express.Router();
const ops = require('../controllers/missionOps');

router.get('/readiness/triage', ops.getReadinessTriage);
router.get('/risk/corridor', ops.getRiskCorridor);
router.post('/simulate', ops.postSimulate);
router.get('/dashboard', ops.getDashboard);

module.exports = router;
