const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/gatewayAuth');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Quản lý xác thực người dùng
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - accountType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               accountType:
 *                 type: string
 *                 enum: [email, google]
 *               password:
 *                 type: string
 *               isGoogleSignUp:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Email đã tồn tại hoặc thiếu thông tin
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               isGoogleSignIn:
 *                 type: boolean
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Sai thông tin đăng nhập
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Gửi mã OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               isResetPassword:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: OTP đã được gửi
 *       404:
 *         description: Email không tồn tại
 */
router.post('/send-otp', authController.sendOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Xác thực mã OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP hợp lệ
 *       400:
 *         description: OTP không hợp lệ
 */
router.post('/verify-otp', authController.verifyOTP);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Thay đổi mật khẩu
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - userId
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thay đổi mật khẩu thành công
 *       401:
 *         description: Mật khẩu hiện tại không đúng
 */
router.post('/change-password', authController.changePassword);

/**
 * @swagger
 * /auth/verify-token:
 *   get:
 *     summary: Xác thực token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token hợp lệ
 *       401:
 *         description: Token không hợp lệ hoặc hết hạn
 */
router.get('/verify-token', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Token hợp lệ', user: req.user });
});

module.exports = router;