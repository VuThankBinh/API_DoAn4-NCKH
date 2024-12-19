const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/gatewayAuth');

router.get('/all-users', userController.getAllUsers);

router.get('/get-user-by-email/:email', userController.getUserByEmail);

router.get('/get-class-created-by-user/:userId',userController.getClassCreatedByUser);

router.get('/get-class-joined-by-user/:userId',userController.getClassJoinedByUser);

router.put('/update-information',authenticateToken,userController.updateInformation);
module.exports = router;