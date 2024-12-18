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
 *                   condition:
 *                     type: string
 *                   theory:
 *                     type: string
 *                   source:
 *                     type: string
 *                   subjectID:
 *                     type: string
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
 * /lessons/{id}:
 *   get:
 *     summary: Lấy bài học theo ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:id', lessonController.getLessonById);

/**
 * @swagger
 * /lessons/code-exercises/{id}:
 *   get:
 *     summary: Lấy danh sách bài tập code theo ID bài học
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:id/code-exercises', lessonController.getCodeExercisesByLessonId);

/**
 * @swagger
 * /lessons/quizz-exercises/{id}:
 *   get:
 *     summary: Lấy danh sách bài tập trắc nghiệm theo ID bài học
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/:id/quizz-exercises', lessonController.getQuizzExercisesByLessonId);

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
 *               language:  
 *                 type: string
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

/**
 * @swagger
 * /lessons/save-quizz-exercise:
 *   post:
 *     summary: Lưu bài tập trắc nghiệm
 *     tags: [Lessons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               userId:
 *                 type: string
 *               score:
 *                 type: number
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Lưu thành công
 */
router.post('/save-quizz-exercise', lessonController.saveQuizzExercise);

/**
 * @swagger
 * /lessons/quizz-exercise/{userId}/{lessonId}:
 *   get:
 *     summary: Lấy thông tin bài tập trắc nghiệm
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
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/quizz-exercise/:userId/:lessonId', lessonController.getQuizzExercise);
 
router.get('/learning-lessons/:userId', lessonController.getLearningLessons);

router.get('/code-exercises/:userId/:subjectId', lessonController.getUserCodeExercises);
module.exports = router;
