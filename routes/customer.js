const express = require('express');
const customerController = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Public route — no auth required
router.post('/inquiry', upload.array('attachments', 10), (req, res) => customerController.inquiry(req, res));

// Protected routes
router.get('/', protect, (req, res) => customerController.getAll(req, res));
router.post('/', protect, upload.single('attachment'), (req, res) => customerController.create(req, res));
router.put('/:id', protect, upload.single('attachment'), (req, res) => customerController.update(req, res));
router.delete('/:id', protect, (req, res) => customerController.delete(req, res));
router.post('/:id/comment', protect, (req, res) => customerController.addComment(req, res));
router.post('/:id/forward', protect, upload.array('attachments', 10), (req, res) => customerController.forwardInquiry(req, res));
router.post('/:id/share-document', protect, upload.single('attachment'), (req, res) => customerController.shareDocument(req, res));

module.exports = router;
