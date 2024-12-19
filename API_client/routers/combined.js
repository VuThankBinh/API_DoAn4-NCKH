const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();
const router = express.Router();

const vntk = require('vntk');
const wordTokenizer = vntk.wordTokenizer();
const posTag = vntk.posTag();
// Middleware
router.use(cors());
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cấu hình
// const API_KEY = 'AIzaSyBfw6XYg_Id3TewtZnjh6lz0JEfNDRFktA';
const API_KEY = 'AIzaSyBIoUHSBOP8qmCMyTusHzArpB1AAji9qNE';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
// const API_URL= 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
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

/**
 * @swagger
 * tags:
 *   name: Combined
 *   description: Các API tổng hợp
 */

/**
 * @swagger
 * /combined/chat:
 *   post:
 *     summary: Gửi tin nhắn đến chatbot
 *     tags: [Combined]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 */

/**
 * @swagger
 * /execute:
 *   post:
 *     summary: Thực thi mã code
 *     tags: [Combined]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - script
 *               - language
 *             properties:
 *               script:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thực thi thành công
 *       429:
 *         description: Đã đạt giới hạn số lần thực thi
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Tải file lên Google Drive
 *     tags: [Combined]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folderName:
 *                 type: string
 *               uploaderEmail:
 *                 type: string
 *               teacherEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tải file thành công
 *       400:
 *         description: Không có file được tải lên
 */

// Chatbot route
router.post('/chat', async (req, res) => {
    try {
        const { message,output,code,problem,language, sessionId } = req.body;
        if (!chatHistories[sessionId]) {
            chatHistories[sessionId] = [];
        }
        
        const hiList = ['hi', 'hello', 'xin chào', 'chào bạn', 'chào','hey','halo','chào mừng','chào mừng bạn','chào mừng bạn đến với','chào mừng bạn đến với ai'];
        let isHi = false;
        for(let i = 0; i < hiList.length; i++) {
            if(message.toLowerCase().trim().includes(hiList[i])) {
                isHi = true;
                break;
            }
        }
        if( isHi ) {
            res.json({ reply: 'Xin chào bạn! Tôi là AIC bot tôi giúp gì được cho bạn?' });
            return;
        }
        
        if(!problem) {
            res.json({ reply: 'Bạn chưa nhập bài toán của bạn! Hãy nhập bài toán của bạn!' });
            return;
        }
        if(!code) {
            res.json({ reply: 'Bạn chưa nhập code của bạn! Hãy nhập code của bạn!' });
            return;
        }
        if(!output) {
            res.json({ reply: 'Bạn chưa chạy chương trình của bạn! Hãy chạy chương trình của bạn!' });
            return;
        }
        if(!language) {
            res.json({ reply: 'Bạn chưa nhập ngôn ngữ của bạn! Hãy nhập ngôn ngữ của bạn!' });
            return;
        }
        const chatHistory = chatHistories[sessionId];
        chatHistory.push({ role: "user", parts: [{ text: message+ " language: "+ language + " code: "+ code + " problem: "+ problem + " output: "+ output }] });
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

// Training data cho classifier
classifier.addDocument('hi hello chào xin chào', 'greeting');
classifier.addDocument('code chương trình', 'code_request');
classifier.addDocument('output kết quả chạy', 'output_request');
classifier.addDocument('ngôn ngữ java python javascript', 'language_request');
classifier.addDocument('bài toán vấn đề problem', 'problem_request');
classifier.train();

router.post('/chatAI', async (req, res) => {
    try {
        const { message, output, code, problem, language, sessionId } = req.body;
        const hiList = ['hi', 'hello', 'xin chào', 'chào bạn', 'chào','hey','halo','chào mừng','chào mừng bạn','chào mừng bạn đến với','chào mừng bạn đến với ai'];
        let isHi = false;
        for(let i = 0; i < hiList.length; i++) {
            if(message.toLowerCase().trim().includes(hiList[i])) {
                isHi = true;
                break;
            }
        }
        if( isHi ) {
            res.json({ reply: 'Xin chào bạn! Tôi là AIC bot tôi giúp gì được cho bạn?' });
            return;
        }
        
        if(!problem) {
            res.json({ reply: 'Bạn chưa nhập bài toán của bạn! Hãy nhập bài toán của bạn!' });
            return;
        }
        if(!code) {
            res.json({ reply: 'Bạn chưa nhập code của bạn! Hãy nhập code của bạn!' });
            return;
        }
        if(!output) {
            res.json({ reply: 'Bạn chưa chạy chương trình của bạn! Hãy chạy chương trình của bạn!' });
            return;
        }
        if(!language) {
            res.json({ reply: 'Bạn chưa nhập ngôn ngữ của bạn! Hãy nhập ngôn ngữ của bạn!' });
            return;
        }
        const programmingKeywords = [
            'code', 'lập trình', 'debug', 'lỗi', 'bug', 'sửa', 'kiểm tra',
            'function', 'hàm', 'class', 'biến', 'vòng lặp', 'điều kiện','hỗ trợ','phương pháp','cách làm','giúp','hướng dẫn','hướng làm',
            'thuật toán', 'giải thuật', 'compile', 'runtime', 'syntax',
            'javascript', 'python', 'java', 'c++', 'php'
        ];

        const isRelatedToProgramming = message.toLowerCase().split(' ').some(word => 
            programmingKeywords.some(keyword => word.includes(keyword))
        );

        if (!isRelatedToProgramming) {
            return res.json({
                reply: 'Xin lỗi, tôi chỉ có thể giúp bạn với các vấn đề liên quan đến lập trình và code. Hãy đặt câu hỏi liên quan đến bài toán của bạn.',
                isRelevant: false
            });
        }
        // Tokenize tiếng Việt
        const tokens = wordTokenizer.tag(message.toLowerCase());
        
        // Gán nhãn từ loại (POS Tagging)
        const poses = posTag.tag(message.toLowerCase());

        // Tự xây dựng từ điển sentiment tiếng Việt
        const vietnameseSentiment = {
            positive: ['tốt', 'hay', 'tuyệt', 'xuất sắc', 'giỏi', 'thích', 'đúng', 'chính xác'],
            negative: ['sai', 'lỗi', 'kém', 'tệ', 'khó', 'phức tạp', 'không hiểu'],
            neutral: ['kiểm tra', 'xem', 'chạy', 'thử']
        };

        // Phân tích sentiment
        const analyzeSentiment = (text) => {
            let score = 0;
            const words = text.toLowerCase().split(' ');
            
            words.forEach(word => {
                if (vietnameseSentiment.positive.includes(word)) score += 1;
                if (vietnameseSentiment.negative.includes(word)) score -= 1;
            });

            return {
                score,
                sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
            };
        };

        // Phân loại ý định (Intent Classification)
        const vietnameseIntents = {
            greeting: ['xin chào', 'chào', 'hi', 'hello', 'hey','chào mừng','chào mừng bạn','chào mừng bạn đến với','chào mừng bạn đến với ai','hú','alo','say'],
            question: ['giúp', 'hỏi', 'làm sao', 'như thế nào', 'tại sao','phân tích','hỗ trợ','phương pháp','cách làm'],
            code_review: ['kiểm tra', 'review', 'xem code', 'debug', 'hướng dẫn', 'hướng làm'],
            problem_solving: ['giải quyết', 'sửa lỗi', 'fix bug', 'phương pháp', 'hướng dẫn', 'hướng làm']
        };

        const classifyIntent = (text) => {
            for (const [intent, patterns] of Object.entries(vietnameseIntents)) {
                if (patterns.some(pattern => text.toLowerCase().includes(pattern))) {
                    return intent;
                }
            }
            return 'unknown';
        };

        // Phân tích ngữ cảnh
        const contextAnalysis = {
            tokens,
            poses,
            sentiment: analyzeSentiment(message),
            intent: classifyIntent(message),
            entities: {
                code: code ? true : false,
                language: language || 'unknown',
                hasProblem: problem ? true : false
            }
        };

        console.log('Phân tích NLP:', contextAnalysis);

        // Xử lý phản hồi dựa trên phân tích
        if (contextAnalysis.intent === 'greeting') {
            return res.json({
                reply: 'Xin chào! Tôi là AIC bot, tôi có thể giúp gì cho bạn?',
                analysis: contextAnalysis
            });
        }

        // - Cảm xúc: ${contextAnalysis.sentiment.sentiment}
        // Tạo prompt nâng cao với context tiếng Việt
        const enhancedPrompt = `
        Phân tích yêu cầu:
        - Ý định: ${contextAnalysis.intent}
        - Ngôn ngữ lập trình: ${contextAnalysis.entities.language}
        
        Tin nhắn: ${message}
        Bài toán: ${problem || 'Chưa có'}
        Code: ${code || 'Chưa có'}
        Output: ${output || 'Chưa có'}
        
        Vui lòng phân tích và trả lời bằng tiếng Việt. Và hãy nêu hướng làm
        `;

        // Gửi đến API với prompt đã được tối ưu
        const apiContent = [
            {
                role: "user",
                parts: [{ text: enhancedPrompt }]
            }
        ];

        // Gửi request đến Gemini API và xử lý response
        const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
            contents: apiContent
        });

        if (response.data.candidates && response.data.candidates.length > 0) {
            const botReply = response.data.candidates[0].content.parts[0].text;
            
            // Lưu vào chat history nếu cần
            if (chatHistories[sessionId]) {
                chatHistories[sessionId].push({
                    role: "model",
                    parts: [{ text: botReply }]
                });
            }

            // Trả về response đầy đủ
            return res.json({
                reply: botReply,
                analysis: contextAnalysis,
                sentiment: contextAnalysis.sentiment,
                intent: contextAnalysis.intent,
                tokens: tokens,
                poses: poses,
                isRelevant: true
            });
        } else {
            throw new Error('Không nhận được phản hồi từ AI');
        }

    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({
            error: 'Lỗi xử lý',
            details: error.message
        });
    }
});

// Hàm hỗ trợ phân tích
function detectProgrammingLanguage(language) {
    const languagePatterns = {
        'javascript': /js|javascript|node/i,
        'python': /py|python/i,
        'java': /java(?!script)/i,
        'cpp': /c\+\+|cpp/i,
        'sql': /sql/i,
        'csharp': /c#|csharp/i,
        'html': /html/i,
        'css': /css/i,
        'php': /php/i,
        'ruby': /ruby/i,
        'swift': /swift/i,
        'kotlin': /kotlin/i,
        'typescript': /ts|typescript/i
    };

    for (const [lang, pattern] of Object.entries(languagePatterns)) {
        if (pattern.test(language)) {
            return lang;
        }
    }
    return 'unknown';
}

function extractProblemContext(problem) {
    if (!problem) return null;
    
    const keywords = natural.NGrams.ngrams(problem, 2)
        .map(gram => gram.join(' '))
        .filter(gram => {
            // Lọc các từ khóa quan trọng
            return !natural.stopwords.includes(gram);
        });

    return {
        keywords,
        complexity: analyzeProblemComplexity(problem),
        domain: detectProblemDomain(problem)
    };
}

function analyzeContext(history, currentAnalysis) {
    return {
        conversationFlow: detectConversationFlow(history),
        userIntent: currentAnalysis.intent,
        sentiment: currentAnalysis.sentiment,
        technicalContext: {
            language: currentAnalysis.entities.language,
            problemDomain: currentAnalysis.entities.problem?.domain,
            codeComplexity: analyzeCodeComplexity(currentAnalysis.entities.code)
        }
    };
}

function generateEnhancedPrompt({message, context, code, problem, language, output}) {  
    let prompt = `Analyzing request with context:
    - Intent: ${context.userIntent}
    - Technical Domain: ${context.technicalContext.problemDomain}
    - Language: ${context.technicalContext.language}
    - Conversation Flow: ${context.conversationFlow}
    
    User Message: ${message}
    Problem: ${problem}
    Code: ${code}
    Output: ${output}
    
    Please provide a detailed analysis and response considering the above context.`;

    return prompt;
}
router.get('/chat/clone', (req, res) => {
    const {message} = req.body;
    res.json({
        message: `Có phải bạn vừa chat ${message} không?`
    });
});
router.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        message: 'Đã xảy ra lỗi không mong muốn!',
        error: err.message
    });
});
module.exports = router;