const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticateToken } = require('../middlewares/gatewayAuth');

router.post('/create', classController.createClass);
router.post('/join', classController.joinClass);
router.post('/leave', classController.leaveClass);
router.post('/delete', classController.deleteClass);

module.exports = router;