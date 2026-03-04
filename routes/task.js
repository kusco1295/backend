
const express = require('express');
const taskController = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/', protect, upload.single('attachment'), (req, res) => taskController.create(req, res));
router.get('/', protect, (req, res) => taskController.getAll(req, res));
router.put('/:id', protect, (req, res) => taskController.update(req, res));

module.exports = router;
