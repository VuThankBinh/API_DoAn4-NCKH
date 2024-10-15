const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 9000;

app.use(cors());
app.use(express.json());

const API_KEY = 'AIzaSyBfw6XYg_Id3TewtZnjh6lz0JEfNDRFktA'; // Replace with your API key
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Khởi tạo một đối tượng để lưu trữ lịch sử chat cho mỗi phiên
const chatHistories = {};

app.post('/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        // console.log('Received message:', message);
        // console.log('Session ID:', sessionId);

        // Khởi tạo hoặc lấy lịch sử chat cho phiên này
        if (!chatHistories[sessionId]) {
            chatHistories[sessionId] = [];
        }
        const chatHistory = chatHistories[sessionId];

        // Thêm tin nhắn mới vào lịch sử
        chatHistory.push({ role: "user", parts: [{ text: message }] });

        // Chuẩn bị nội dung cho API call
        const apiContent = [
            { role: "user", parts: [{ text: "You are an AI assistant. Please respond to the following conversation and the new message at the end:" }] },
            ...chatHistory
        ];

        const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
            contents: apiContent
        });

        // console.log('Gemini API response:', JSON.stringify(response.data, null, 2));

        if (response.data.candidates && response.data.candidates.length > 0 && response.data.candidates[0].content) {
            const botReply = response.data.candidates[0].content.parts[0].text;
            console.log('Bot reply:', botReply);

            // Thêm câu trả lời của bot vào lịch sử
            chatHistory.push({ role: "model", parts: [{ text: botReply }] });

            res.json({ reply: botReply });
        } else {
            console.error('Unexpected response structure:', response.data);
            throw new Error('Unexpected response structure from Gemini API');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Thêm route để xóa lịch sử chat khi cần
app.post('/clear-chat', (req, res) => {
    const { sessionId } = req.body;
    if (chatHistories[sessionId]) {
        delete chatHistories[sessionId];
        res.json({ message: 'Chat history cleared' });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});