const mongoose = require('mongoose');

const codeExerciseSchema = new mongoose.Schema({
    code: { type: String, default: '' },
    score: { type: Number, default: 0 },
    condition: { type: String, default: 'Not Started' }
});

const quizzSchema = new mongoose.Schema({
    score: { type: Number, default: 0 },
    answers: [{ type: String }],
    condition: { type: String, default: 'Not Started' }
});

const lessonCompletedSchema = new mongoose.Schema({
    lessonId: { type: String, required: true },
    quantityCodeExercise: { type: Number, default: 0 },
    codeExercises: [codeExerciseSchema],
    condition: { type: String, default: 'Not Started' },
    quizz: quizzSchema
});

const userSchema = new mongoose.Schema({
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
