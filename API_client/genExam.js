// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 5000;

// // Hàm để tạo bài tập tự động cho các chủ đề khác nhau
// function generateExercises() {
//     const exercises = [];

//     // Bài tập Thuật toán
//     const sortingAlgorithms = [
//         {
//             question: "Viết hàm sắp xếp mảng số nguyên theo thứ tự tăng dần.",
//             solution: "function bubbleSort(arr) { /* logic here */ }"
//         },
//         {
//             question: "Viết hàm sắp xếp mảng số nguyên theo thứ tự giảm dần.",
//             solution: "function quickSort(arr) { /* logic here */ }"
//         }
//     ];

//     const searchingAlgorithms = [
//         {
//             question: "Viết hàm tìm kiếm nhị phân trong một mảng đã được sắp xếp.",
//             solution: "function binarySearch(arr, target) { /* logic here */ }"
//         },
//         {
//             question: "Viết hàm tìm kiếm tuyến tính trong một mảng.",
//             solution: "function linearSearch(arr, target) { /* logic here */ }"
//         }
//     ];

//     exercises.push(...sortingAlgorithms, ...searchingAlgorithms);

//     // Bài tập OOP
//     const oopExercises = [
//         {
//             question: "Tạo một lớp 'Hình tròn' với thuộc tính bán kính và phương thức tính diện tích.",
//             solution: `
// class Circle {
//     constructor(radius) {
//         this.radius = radius;
//     }
    
//     area() {
//         return Math.PI * this.radius * this.radius;
//     }
// }
// `
//         },
//         {
//             question: "Tạo một lớp 'Xe hơi' với các thuộc tính như 'hãng sản xuất', 'màu sắc' và phương thức 'di chuyển'.",
//             solution: `
// class Car {
//     constructor(brand, color) {
//         this.brand = brand;
//         this.color = color;
//     }
    
//     move() {
//         console.log('Xe đang di chuyển');
//     }
// }
// `
//         }
//     ];

//     exercises.push(...oopExercises);

//     // Bài tập CSDL SQL Server
//     const sqlExercises = [
//         {
//             question: "Viết câu lệnh SQL để lấy tất cả các bản ghi từ bảng 'Products'.",
//             solution: "SELECT * FROM Products;"
//         },
//         {
//             question: "Viết câu lệnh SQL để lấy tất cả các bản ghi từ bảng 'Orders' và sắp xếp theo 'OrderDate'.",
//             solution: "SELECT * FROM Orders ORDER BY OrderDate;"
//         },
//         {
//             question: "Viết câu lệnh SQL để lấy tất cả các bản ghi từ bảng 'Customers' nơi 'Country' là 'Vietnam'.",
//             solution: "SELECT * FROM Customers WHERE Country = 'Vietnam';"
//         },
//         {
//             question: "Viết câu lệnh SQL để thực hiện JOIN giữa bảng 'Customers' và 'Orders'.",
//             solution: "SELECT Customers.Name, Orders.OrderDate FROM Customers JOIN Orders ON Customers.CustomerID = Orders.CustomerID;"
//         }
//     ];

//     exercises.push(...sqlExercises);

//     return exercises;
// }

// // API để tạo bài tập tự động
// app.get('/generate-exercises', (req, res) => {
//     const exercises = generateExercises();
//     res.json(exercises);
// });

// // Khởi động server
// app.listen(PORT, () => {
//     console.log(`Server running at port ${PORT}`);
// });
const express = require('express');
const compromise = require('compromise');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Để xử lý JSON request

// Hàm phân tích văn bản và tạo câu hỏi
function generateQuizQuestions(text) {
    const doc = compromise(text);
    const sentences = doc.sentences().out('array'); // Tách văn bản thành câu
    const keywords = doc.nouns().out('array'); // Tìm danh từ chính

    const questions = [];

    sentences.slice(0, 5).forEach((sentence, index) => {
        const keyword = keywords[index % keywords.length] || 'ý chính';
        const question = `Điều nào sau đây đúng về: "${keyword}"?`;

        questions.push({
            question,
            options: [
                `${keyword} được đề cập trong: "${sentence}"`,
                `Không có thông tin về: "${keyword}"`,
                `Một ý không liên quan đến: "${keyword}"`,
                `Thông tin chưa rõ ràng về: "${keyword}"`
            ],
            answer: `${keyword} được đề cập trong: "${sentence}"`
        });
    });

    return questions;
}

// API để tạo câu hỏi trắc nghiệm
app.post('/generate-quiz', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Vui lòng cung cấp văn bản.' });
    }

    const quizQuestions = generateQuizQuestions(text);
    res.json(quizQuestions);
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});