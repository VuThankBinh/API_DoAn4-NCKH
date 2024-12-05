const express = require('express');
const { authenticateToken } = require('../utils/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Protected
 *   description: Các API yêu cầu xác thực
 */

/**
 * @swagger
 * /protected:
 *   get:
 *     summary: Lấy dữ liệu được bảo vệ
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Không có quyền truy cập
 */

router.get('/user-info', authenticateToken, (req, res) => {
    res.json({ message: 'Thông tin người dùng', user: req.user });
});

/**
 * @swagger
 * /user-info:
 *   get:
 *     summary: Lấy thông tin người dùng
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Không có quyền truy cập
 */

module.exports = router;