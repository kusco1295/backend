const express = require('express');
const materialController = require('../controllers/material.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, (req, res) => materialController.getAll(req, res));
router.post('/add', protect, (req, res) => materialController.add(req, res));
router.post('/withdraw', protect, (req, res) => materialController.withdraw(req, res));

module.exports = router;
