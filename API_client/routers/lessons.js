const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authenticateToken } = require('../middlewares/gatewayAuth');

/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Quản lý bài học và bài tập
 */

/**
 * @swagger
 * /lessons/subjects:
 *   get:
 *     summary: Lấy danh sách môn học
 *     tags: [Lessons]
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   image:
 *                     type: string
 *                   description:
 *                     type: string
 */
router.get('/subjects', lessonController.getSubject);
//get detail lesson
/**
 * @swagger
 * /lessons/subject/{subjectId}:
 *   get:
 *     summary: Lấy chi tiết bài học theo môn học
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description:
 *      
 */
router.get('/subject/:subjectId', lessonController.getDetailLesson);

/**
 * @swagger
 * /lessons/user/{userId}/subject/{subjectId}:
 *   get:
 *     summary: Lấy tất cả bài học theo điều kiện của người dùng
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/user/:userId/subject/:subjectId', lessonController.getAllLessons);

/**
 * @swagger
 * /lessons/save-lesson:
 *   post:
 *     summary: Lưu tiến độ bài học
 *     tags: [Lessons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               lessonId:
 *                 type: string
 *               quantityCodeExercise:
 *                 type: number
 *     responses:
 *       200:
 *         description: Lưu thành công
 */
router.post('/save-lesson', lessonController.saveLesson);

/**
 * @swagger
 * /lessons/save-code-exercise:
 *   post:
 *     summary: Lưu bài tập code
 *     tags: [Lessons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               lessonId:
 *                 type: string
 *               codeExerciseId:
 *                 type: string
 *               code:
 *                 type: string
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Lưu thành công
 */
router.post('/save-code-exercise', lessonController.saveCodeExercise);

/**
 * @swagger
 * /lessons/code-exercise/{userId}/{lessonId}/{codeExerciseId}:
 *   get:
 *     summary: Lấy thông tin bài tập code
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: codeExerciseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/code-exercise/:userId/:lessonId/:codeExerciseId', lessonController.getCodeExercise);

// Tương tự cho các routes còn lại...

module.exports = router;