const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

// Cấu hình Google Drive API
const CLIENT_ID = '492221263426-fq74j5oshb9d5pcrgkq0ukap7ovnm31d.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04EIlqrRCBtvWCgYIARAAGAQSNwF-L9Irdw728uV6ZBppmtPwMuknL-iod74317nLF13UiBrh1sUpGdogBCIahFX7qVAPn3m9f8w';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

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
      const teacherEmail = req.body.teacherEmail; // Email của giáo viên

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
          role: 'writer',
          type: 'user',
          emailAddress: uploaderEmail
        },
      });

      // Cấp quyền cho giáo viên
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: teacherEmail
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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});