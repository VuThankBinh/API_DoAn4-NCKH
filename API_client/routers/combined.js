const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();

// Middleware
router.use(cors());
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cấu hình
const API_KEY = 'AIzaSyBfw6XYg_Id3TewtZnjh6lz0JEfNDRFktA';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const chatHistories = {};

const CLIENT_ID = '492221263426-fq74j5oshb9d5pcrgkq0ukap7ovnm31d.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04EIlqrRCBtvWCgYIARAAGAQSNwF-L9Irdw728uV6ZBppmtPwMuknL-iod74317nLF13UiBrh1sUpGdogBCIahFX7qVAPn3m9f8w';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Chatbot route
router.post('/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        if (!chatHistories[sessionId]) {
            chatHistories[sessionId] = [];
        }
        const chatHistory = chatHistories[sessionId];
        chatHistory.push({ role: "user", parts: [{ text: message }] });
        const apiContent = [
            { role: "user", parts: [{ text: "You are an AI assistant. Please respond to the following conversation and the new message at the end:" }] },
            ...chatHistory
        ];
        const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
            contents: apiContent
        });
        if (response.data.candidates && response.data.candidates.length > 0 && response.data.candidates[0].content) {
            const botReply = response.data.candidates[0].content.parts[0].text;
            chatHistory.push({ role: "model", parts: [{ text: botReply }] });
            res.json({ reply: botReply });
        } else {
            throw new Error('Unexpected response structure from Gemini API');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Clear chat history route
router.post('/clear-chat', (req, res) => {
    const { sessionId } = req.body;
    if (chatHistories[sessionId]) {
        delete chatHistories[sessionId];
        res.json({ message: 'Chat history cleared' });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// Code execution route
router.post('/execute', (req, res) => {
    try {
        let postData = req.body;
        if (!postData.script || !postData.language) {
            throw new Error('Missing required fields: script and language must be provided');
        }
        
        postData = {
            ...postData,
            clientId: "37b74c2b9f31a362ad8ecb4ecbb22441",
            clientSecret: "c01683242339952959b606fa035fbaeb59b6894fb11bf3dfa8415994c0b5ba0c",
        };

        const options = {
            hostname: 'api.jdoodle.com',
            port: 443,
            path: '/v1/execute',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const proxyReq = https.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => {
                data += chunk;
            });
            proxyRes.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    if (responseData.error === "Daily limit reached" && responseData.statusCode === 429) {
                        res.status(429).json({ 
                            error: 'Đã đạt giới hạn số lần thực thi hàng ngày. Vui lòng thử lại sau.',
                            statusCode: 429
                        });
                    } else {
                        res.status(proxyRes.statusCode).json(responseData);
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                    res.status(500).json({ error: 'Lỗi khi xử lý phản hồi từ JDoodle' });
                }
            });
        });

        proxyReq.on('error', (error) => {
            console.error('Error in proxy request:', error);
            res.status(500).json({ error: 'Lỗi khi thực thi mã' });
        });

        proxyReq.write(JSON.stringify(postData));
        proxyReq.end();

    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// File upload route
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Không có file nào được tải lên.');
    }
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const folderName = req.body.folderName || 'Classroom2';
        const uploaderEmail = req.body.uploaderEmail;
        const teacherEmail = req.body.teacherEmail;

        const folderId = await createFolderIfNotExists(folderName);
        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(filePath),
        };
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name',
        });
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'writer',
                type: 'user',
                emailAddress: uploaderEmail
            },
        });
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'user',
                emailAddress: teacherEmail
            },
        });
        fs.unlinkSync(filePath);
        res.status(200).json({
            message: 'File đã được tải lên Google Drive thành công',
            fileId: response.data.id,
            fileName: response.data.name,
            folderName: folderName,
        });
    } catch (error) {
        console.error('Lỗi khi tải file lên Drive:', error);
        res.status(500).json({
            message: 'Đã xảy ra lỗi khi tải file lên Google Drive',
            error: error.message,
        });
    }
});

async function createFolderIfNotExists(folderName) {
    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
        fields: 'files(id, name)',
    });
    if (response.data.files.length > 0) {
        return response.data.files[0].id;
    } else {
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };
        const folder = await drive.files.create({
            resource: folderMetadata,
            fields: 'id',
        });
        return folder.data.id;
    }
}

// Logging middleware
router.use((req, res, next) => {
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        message: 'Đã xảy ra lỗi không mong muốn!',
        error: err.message
    });
});

module.exports = router;