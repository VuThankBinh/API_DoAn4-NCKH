const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String },
    condition: { type: String },
    theory: { type: String },
    source: { type: String },
    subjectID: { type: String },
    exercises: [{
        type: { type: String, enum: ['code', 'single', 'multiple'] },
        question: { type: String },
        options: [{ type: String }],
        correctAnswer: mongoose.Schema.Types.Mixed,
        output: { type: String },
        // Thêm các trường khác nếu cần
    }]
});
module.exports = mongoose.model('Lesson', lessonSchema);