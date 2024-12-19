const { language } = require('googleapis/build/src/apis/language');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema cho câu trả lời quiz
const quizzAnswerSchema = new Schema({
    questionIndex: String,
    selectedAnswers: [String]
});
 
// Schema cho quiz
const quizzSchema = new Schema({
    score: { type: Number, default: 0 },
    answers: [quizzAnswerSchema],
    condition: { type: String, default: 'Not Started' }
});

// Schema cho bài học đã hoàn thành
const lessonCompletedSchema = new Schema({
    lessonId: String,
    quantityCodeExercise: { type: Number, default: 0 },
    codeExercises: [{
        code: String,
        language: String,
        condition: String
    }],
    condition: { type: Number, default: 0 },
    quizz: quizzSchema
});

// Schema User
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    accountType: { type: String, required: true },
    password: { type: String },
    name: { type: String, default: '' },
    tel: { type: String, default: '' },
    joinedClasses: [{ type: String }],
    createdClasses: [{ type: String }],
    lessonsCompleted: [lessonCompletedSchema]
});

module.exports = mongoose.model('User', userSchema);
