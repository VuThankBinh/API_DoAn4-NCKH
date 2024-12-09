const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticateToken } = require('../middlewares/gatewayAuth');

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Quản lý lớp học
 */

/**
 * @swagger
 * /classes/create:
 *   post:
 *     summary: Tạo lớp học mới
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - teacher
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên lớp học
 *               teacher:
 *                 type: string
 *                 description: Email của giáo viên
 *     responses:
 *       201:
 *         description: Tạo lớp học thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 class:
 *                   type: object
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       404:
 *         description: Không tìm thấy giáo viên
 */
router.post('/create', classController.createClass);

/**
 * @swagger
 * /classes/join:
 *   post:
 *     summary: Tham gia lớp học
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - class_id
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của học viên
 *               class_id:
 *                 type: string
 *                 description: Mã lớp học
 *     responses:
 *       200:
 *         description: Tham gia lớp học thành công
 *       400:
 *         description: Đã tham gia lớp học hoặc thiếu thông tin
 *       404:
 *         description: Không tìm thấy lớp học hoặc người dùng
 */
router.post('/join', classController.joinClass);

/**
 * @swagger
 * /classes/leave:
 *   post:
 *     summary: Rời khỏi lớp học
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - class_id
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email của học viên
 *               class_id:
 *                 type: string
 *                 description: Mã lớp học
 *     responses:
 *       200:
 *         description: Rời khỏi lớp học thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       404:
 *         description: Không tìm thấy lớp học hoặc người dùng
 */
router.post('/leave', classController.leaveClass);

/**
 * @swagger
 * /classes/delete:
 *   post:
 *     summary: Xóa lớp học
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teacher
 *               - class_id
 *             properties:
 *               teacher:
 *                 type: string
 *                 description: Email của giáo viên
 *               class_id:
 *                 type: string
 *                 description: Mã lớp học
 *     responses:
 *       200:
 *         description: Xóa lớp học thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       404:
 *         description: Không tìm thấy lớp học hoặc không có quyền xóa
 */
router.post('/delete', classController.deleteClass);

module.exports = router;