const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

let accessToken = "";

const drive = google.drive({ version: 'v3', auth: oauth2Client });
// Hàm tạo thư mục nếu chưa tồn tại
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
  app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('Không có file nào được tải lên.');
    }
  
    try {
      const filePath = req.file.path;
      const fileName = req.file.originalname;
      const folderName = req.body.folderName || 'Classroom2';
      const uploaderEmail = req.body.uploaderEmail; // Email của người tải lên
      // accessToken = req.body.accessToken; // Token truy cập của người tải lên

      // Tạo client OAuth2 mới với token truy cập của người dùng
      const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
      oauth2Client.setCredentials({ access_token: tokens.access_token });
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      // Tạo hoặc lấy ID của thư mục
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

      // Cấp quyền cho người tải lên
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'owner', // Cấp quyền sở hữu cho người tải lên
          type: 'user',
          emailAddress: uploaderEmail
        },
      });

      // Xóa file tạm sau khi đã upload lên Drive
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
app.use((req, res, next) => {
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Đã xảy ra lỗi không mong muốn!',
    error: err.message
  });
});

// Route để bắt đầu xác thực
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });
  res.redirect(authUrl);
});

// Route callback để nhận token
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  // Kiểm tra xem code có tồn tại không
  if (!code) {
    return res.status(400).send('Mã xác thực không hợp lệ.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Lưu refresh token để sử dụng sau này
    const refreshToken = tokens.refresh_token; // Lưu refresh token
    const accessToken = tokens.access_token; // Lưu access token

    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token); // Nếu có

    oauth2Client.setCredentials({
      refresh_token: refreshToken // Sử dụng refresh token để lấy access token mới
    });

    const newTokens = await oauth2Client.getAccessToken();
    const newAccessToken = newTokens.token; // Sử dụng access token mới

    res.send('Xác thực thành công! Bạn có thể quay lại ứng dụng.');
  } catch (error) {
    console.error('Lỗi khi nhận token:', error);
    res.status(500).send('Đã xảy ra lỗi khi nhận token.');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});