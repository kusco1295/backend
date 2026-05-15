const express = require('express');
const approvalController = require('../controllers/approval.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', protect, (req, res) => approvalController.getAll(req, res));
router.post('/', protect, upload.single('attachment'), (req, res) => approvalController.create(req, res));
router.put('/:id/status', protect, (req, res) => approvalController.updateStatus(req, res));
router.post('/:id/comment', protect, (req, res) => approvalController.addComment(req, res));
router.delete('/:id', protect, (req, res) => approvalController.delete(req, res));

module.exports = router;
