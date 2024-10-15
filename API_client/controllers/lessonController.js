const Lesson = require('../models/lesson');
const User = require('../models/user'); // Đảm bảo import model User
const Subject = require('../models/subject');

exports.getSubject = async (req, res) => {
    try {
        const subject = await Subject.find({}).select('_id name image description');
        res.status(200).json(subject);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách môn học:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
exports.getDetailLesson = async (req, res) => {
    try {
        const subjectId = req.params.subjectId;
        const lesson = await Lesson.find({ subjectID: subjectId }).select('_id name image condition theory source subjectID');
        res.status(200).json(lesson);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết bài học:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
exports.getAllLessons = async (req, res) => {
    try {
        const { userId, subjectId } = req.params;

        if (!userId || !subjectId) {
            return res.status(400).json({ message: 'Cần cung cấp cả userId và subjectId' });
        }

        const user = await User.findById(userId).select('lessonsCompleted');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const lessons = await Lesson.find({ subjectID: subjectId })
                                    .select('_id name image condition theory source subjectID');

        if (lessons.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài học nào cho môn học này' });
        }
        // console.log(user.lessonsCompleted);
        // Tạo một Map để lưu trữ tình trạng học của mỗi bài học
        const lessonStatusMap = new Map(user.lessonsCompleted.map(lesson => [lesson.lessonId.toString(), lesson.condition]));
        console.log(lessonStatusMap);
        // Cập nhật condition cho mỗi bài học
        const updatedLessons = lessons.map(lesson => {
            const lessonObject = lesson.toObject();
            console.log(lessonObject);
            const status = lessonStatusMap.get(lesson._id.toString());
            console.log(status);
            if (status) {
                lessonObject.condition = status; // Giữ nguyên trạng thái từ lessonsCompleted
            } else {
                lessonObject.condition = 'Not Started'; // Nếu không có trong lessonsCompleted
            }
            return lessonObject;
        });

        res.status(200).json(updatedLessons);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài học:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).select('_id name image condition theory source');
        if (!lesson) {
            return res.status(404).json({ message: 'Không tìm thấy bài học' });
        }
        res.status(200).json(lesson);
    } catch (error) {
        console.error('Lỗi khi lấy bài học:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
exports.getCodeExercisesByLessonId = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Không tìm thấy bài học' });
        }
        
        const codeExercises = lesson.exercises.filter(exercise => exercise.type === 'code');
        
        if (codeExercises.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài tập code nào' });
        }
        
        res.status(200).json(codeExercises);
    } catch (error) {
        console.error('Lỗi khi lấy bài tập code:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
exports.getQuizzExercisesByLessonId = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Không tìm thấy bài học' });
        }
        
        const quizzExercises = lesson.exercises.filter(exercise => 
            exercise.type === 'single' || exercise.type === 'multiple'
        );
        
        if (quizzExercises.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài tập quizz nào' });
        }
        
        res.status(200).json(quizzExercises);
    } catch (error) {
        console.error('Lỗi khi lấy bài tập quizz:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
exports.saveLesson = async (req, res) => {
    try {
        const { userId, lessonId, quantityCodeExercise } = req.body;

        if (!userId || !lessonId || !quantityCodeExercise) {
            return res.status(400).json({ message: 'UserId, lessonId và quantityCodeExercise là bắt buộc' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra xem bài học đã tồn tại trong lessonsCompleted chưa
        const existingLessonIndex = user.lessonsCompleted.findIndex(
            lesson => lesson.lessonId === lessonId
        );

        if (existingLessonIndex !== -1) {
            return res.status(400).json({ message: 'Bài học này đã tồn tại trong lessonsCompleted' });
        }

        // Tạo một lessonCompletedSchema mới
        const newLessonCompleted = {
            lessonId,
            quantityCodeExercise: quantityCodeExercise || 0,
           
        };

        // Thêm vào mảng lessonsCompleted
        user.lessonsCompleted.push(newLessonCompleted);

        await user.save();

        res.status(200).json({
            message: 'Thêm bài học vào lessonsCompleted thành công',
            lessonCompleted: newLessonCompleted
        });
    } catch (error) {
        console.error('Lỗi khi thêm bài học vào lessonsCompleted:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
// Thêm các hàm xử lý khác cho bài học ở đây

exports.saveCodeExercise = async (req, res) => {
    try {
        const { userId, lessonId, codeExerciseId, code, score } = req.body;

        if (!userId || !lessonId || !codeExerciseId || !code) {
            return res.status(400).json({ message: 'UserId, lessonId, codeExerciseId và code là bắt buộc' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        let lessonCompleted = user.lessonsCompleted.find(lesson => lesson.lessonId === lessonId);
        if (!lessonCompleted) {
            return res.status(404).json({ message: 'Không tìm thấy bài học trong lessonsCompleted' });
        }

        const codeExerciseNumber = parseInt(codeExerciseId.replace('code', ''));
        if (isNaN(codeExerciseNumber) || codeExerciseNumber < 1 || codeExerciseNumber > lessonCompleted.quantityCodeExercise) {
            return res.status(400).json({ message: 'ID bài tập code không hợp lệ hoặc vượt quá số lượng cho phép' });
        }

        // Tìm bài tập code theo vị trí trong mảng
        if (codeExerciseNumber > lessonCompleted.codeExercises.length) {
            // Nếu bài tập code chưa tồn tại và số lượng hiện tại đã đạt giới hạn, báo lỗi
            if (lessonCompleted.codeExercises.length >= lessonCompleted.quantityCodeExercise) {
                return res.status(400).json({ message: 'Không thể thêm bài tập code mới. Đã đạt giới hạn số lượng.' });
            }
            // Nếu chưa đạt giới hạn, tạo mới bài tập code
            lessonCompleted.codeExercises.push({
                code: code,
                score: score || 0,
                condition: 'Completed'
            });
        } else {
            // Cập nhật bài tập code đã tồn tại
            lessonCompleted.codeExercises[codeExerciseNumber - 1] = {
                ...lessonCompleted.codeExercises[codeExerciseNumber - 1],
                code: code,
                score: score || 0,
                condition: 'Completed'
            };
        }

        await user.save();

        res.status(200).json({
            message: 'Cập nhật bài tập code thành công',
            updatedCodeExercise: lessonCompleted.codeExercises[codeExerciseNumber - 1]
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật bài tập code:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getCodeExercise = async (req, res) => {
    try {
        const { userId, lessonId, codeExerciseId } = req.params;

        if (!userId || !lessonId || !codeExerciseId) {
            return res.status(400).json({ message: 'UserId, lessonId và codeExerciseId là bắt buộc' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const lessonCompleted = user.lessonsCompleted.find(lesson => lesson.lessonId === lessonId);
        if (!lessonCompleted) {
            return res.status(404).json({ message: 'Không tìm thấy bài học trong lessonsCompleted' });
        }

        const codeExerciseNumber = parseInt(codeExerciseId.replace('code', ''));
        if (isNaN(codeExerciseNumber) || codeExerciseNumber < 1 || codeExerciseNumber > lessonCompleted.quantityCodeExercise) {
            return res.status(400).json({ message: 'ID bài tập code không hợp lệ' });
        }

        const codeExercise = lessonCompleted.codeExercises[codeExerciseNumber - 1];
        if (!codeExercise) {
            return res.status(404).json({ message: 'Không tìm thấy bài tập code' });
        }

        res.status(200).json({
            message: 'Lấy thông tin bài tập code thành công',
            codeExercise: codeExercise
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bài tập code:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.saveQuizzExercise = async (req, res) => {
    try {
        // const { id } = req.params; // ID của bài học
        const { id,userId, score, answers } = req.body;

        if (!userId || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'UserId và answers là bắt buộc' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        let lessonCompleted = user.lessonsCompleted.find(lesson => lesson.lessonId === id);
        if (!lessonCompleted) {
            // Nếu bài học chưa tồn tại trong lessonsCompleted, tạo mới
            lessonCompleted = {
                lessonId: id,
                quizz: { score: 0, answers: [], condition: 'Not Started' }
            };
            user.lessonsCompleted.push(lessonCompleted);
        }

        // Cập nhật thông tin quizz
        lessonCompleted.quizz = {
            score: score || 0,
            answers: answers,
            condition: 'Completed'
        };

        await user.save();

        res.status(200).json({
            message: 'Cập nhật bài tập quizz thành công',
            updatedQuizz: lessonCompleted.quizz
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật bài tập quizz:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
exports.getQuizzExercise = async (req, res) => {
    try {
        const { userId, lessonId } = req.params;

        if (!userId || !lessonId ) {
            return res.status(400).json({ message: 'UserId, lessonId và quizzExerciseId là bắt buộc' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const lessonCompleted = user.lessonsCompleted.find(lesson => lesson.lessonId === lessonId);
        if (!lessonCompleted) {
            return res.status(404).json({ message: 'Không tìm thấy bài học trong lessonsCompleted' });
        }

        const quizzExercise = lessonCompleted.quizz;
        if (!quizzExercise) {
            return res.status(404).json({ message: 'Không tìm thấy bài tập quizz' });
        }

        res.status(200).json({
            message: 'Lấy thông tin bài tập quizz thành công',
            quizzExercise: quizzExercise
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bài tập quizz:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

