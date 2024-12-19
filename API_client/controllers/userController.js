const User = require('../models/user');
const Class = require('../models/class'); // Giả sử bạn có model Class

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

exports.getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
exports.getClassCreatedByUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('createdClasses');
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        
        // Lấy thông tin chi tiết của các lớp học từ bảng Class
        const classes = await Class.find({ _id: { $in: user.createdClasses } })
            .select('name class_id teacher users');  // Chọn các trường cần thiết
        
        res.json(classes);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp học được tạo bởi người dùng:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};
exports.getClassJoinedByUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('joinedClasses');
        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        
        // Lấy thông tin chi tiết của các lớp học từ bảng Class
        const classes = await Class.find({ _id: { $in: user.joinedClasses } })
            .select('name class_id teacher users'); // Chọn các trường cần thiết
        
        res.json(classes);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp học được tạo bởi người dùng:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

exports.updateInformation = async (req, res) => {
    try {
        var user = await User.findById(req.body.userId);
        console.log(`userBefore: ${user}`);
        user.name = req.body.name;
        user.tel = req.body.tel;
        await user.save();
        res.json({message: 'Cập nhật thông tin thành công', user: user});
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
};
// Thêm các hàm xử lý khác cho người dùng ở đây
