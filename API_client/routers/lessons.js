const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authenticateToken } = require('../middlewares/gatewayAuth');
//get subject
router.get('/subjects', lessonController.getSubject);
// get detail lesson
router.get('/subject/:subjectId', lessonController.getDetailLesson);
// get all lessons with user's condition
router.get('/user/:userId/subject/:subjectId', lessonController.getAllLessons);
// get lesson by id
router.get('/:id', lessonController.getLessonById);
// get code exercises by lesson id
router.get('/:id/code-exercises', lessonController.getCodeExercisesByLessonId);
// get quizz exercises by lesson id
router.get('/:id/quizz-exercises', lessonController.getQuizzExercisesByLessonId);
//post save lesson
router.post('/save-lesson', lessonController.saveLesson);
// post save code exercise
router.post('/save-code-exercise', lessonController.saveCodeExercise);
//get code exercise by id
router.get('/code-exercise/:userId/:lessonId/:codeExerciseId', lessonController.getCodeExercise);
// post save quizz exercise
router.post('/save-quizz-exercise', lessonController.saveQuizzExercise);
// get quizz exercise by id
router.get('/quizz-exercise/:userId/:lessonId', lessonController.getQuizzExercise);

// Thêm các route khác cho bài học ở đây

module.exports = router;