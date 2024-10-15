const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authenticateToken } = require('../middlewares/gatewayAuth');

router.get('/', lessonController.getAllLessons);
router.get('/:id', lessonController.getLessonById);
router.get('/:id/exercises', lessonController.getExercisesByLessonId);
// Thêm các route khác cho bài học ở đây

module.exports = router;