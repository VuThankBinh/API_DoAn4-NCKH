require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routers/auth');
const userRoutes = require('./routers/users');
const classRoutes = require('./routers/classes');
const lessonRoutes = require('./routers/lessons');
const combinedRoutes = require('./routers/combined');
const jwtSecret = process.env.JWT_SECRET;
const cors = require('cors');
const { authenticateToken } = require('./utils/authUtils');
const http = require('http');
const socketIO = require('socket.io');
const Docker = require('dockerode');
const docker = new Docker();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const server = http.createServer(app);
app.use(cors());


mongoose.connect('mongodb://localhost:27017/database')
  .then(() => console.log('Kết nối thành công đến MongoDB'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));
app.use(cors({
  origin: '*', // Cho phép tất cả các domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.use(express.json());

// Sử dụng routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/classes', classRoutes);
app.use('/lessons', lessonRoutes);
app.use('/combined', combinedRoutes);
// API hello
app.get('/', (req, res) => {
  res.send('API đang chạy rồi bắt đầu test đi');
});

// API kiểm tra token
app.get('/check-token', authenticateToken, (req, res) => {
  res.json({ message: 'Token hợp lệ', user: req.user });
});

// API được bảo vệ bởi token
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Đây là một API được bảo vệ', user: req.user });
});

// Thêm route để hiển thị danh sách API
app.get('/api-list', (req, res) => {
  const routes = [];

  // Lấy danh sách routes từ auth
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: '/auth' + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });

  res.json(routes);
});
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API Documentation cho hệ thống',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './routers/*.js',
    './API_client/routers/*.js',
    __dirname + '/routers/*.js'
  ],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
console.log('Swagger Docs:', swaggerDocs);

// Đặt route swagger trước các routes khác
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Biến để lưu trữ process đang chạy
let runningProcesses = new Map();

// Hàm kiểm tra image đã tồn tại chưa
async function checkImageExists(imageName) {
    try {
        await docker.getImage(imageName).inspect();
        return true;
    } catch (err) {
        return false;
    }
}

// Hàm pull image với promise
async function pullDockerImage(imageName) {
    return new Promise((resolve, reject) => {
        docker.pull(imageName, (err, stream) => {
            if (err) {
                console.error('[Docker] Pull error:', err);
                return reject(err);
            }

            // Hiển thị tiến trình pull
            docker.modem.followProgress(stream,
                // Callback khi hoàn thành
                (err, output) => {
                    if (err) {
                        console.error('[Docker] Pull progress error:', err);
                        return reject(err);
                    }
                    console.log('[Docker] Pull completed for:', imageName);
                    resolve(output);
                },
                // Callback cho mỗi event
                (event) => {
                    if (event.status) {
                        console.log('[Docker] Pull status:', event.status);
                    }
                }
            );
        });
    });
}

// Thêm hàm kiểm tra và pull image nếu cần
async function ensureImage(imageName) {
    try {
        await docker.getImage(imageName).inspect();
        console.log(`[Docker] Image ${imageName} đã tồn tại`);
    } catch (err) {
        console.log(`[Docker] Image ${imageName} chưa có, đang tải về...`);
        await pullDockerImage(imageName);
    }
}

io.on('connection', (socket) => {
  console.log('\n[Socket] Client connected:', socket.id);
  let currentContainer = null;
  let currentStream = null;
  let isWaitingForInput = false;

  socket.on('execute', async (data) => {
      try {
          console.log('[Execute] Running code:', data.code);

          // Cleanup old container
          if (currentContainer) {
              try {
                  await currentContainer.stop();
                  await currentContainer.remove();
              } catch (error) {
                  console.error('[Cleanup Error]:', error);
              }
          }

          let containerConfig;

          switch (data.language) {
              case 'python':
                  containerConfig = {
                      Image: 'python:3.9-slim',
                      Cmd: ['python', '-u', '-c', data.code],
                      AttachStdin: true,
                      AttachStdout: true,
                      AttachStderr: true,
                      OpenStdin: true,
                      StdinOnce: false,
                      Tty: false,
                      HostConfig: {
                          AutoRemove: true
                      }
                  };
                  break;

              case 'cpp':
                  const cppDir = path.join(__dirname, 'temp');
                  const cppFile = path.join(cppDir, 'main.cpp');
                  const cppImage = 'gcc:latest';

                  // Kiểm tra và tải image nếu cần
                  await ensureImage(cppImage);

                  await fs.mkdir(cppDir, { recursive: true });
                  await fs.writeFile(cppFile, data.code);

                  containerConfig = {
                      Image: cppImage,
                      Cmd: ['/bin/bash', '-c', `
                          set -e
                          echo "Biên dịch code C++..."
                          g++ -o /tmp/program /tmp/main.cpp
                          echo "Chạy chương trình..."
                          /tmp/program
                      `],
                      AttachStdin: true,
                      AttachStdout: true,
                      AttachStderr: true,
                      OpenStdin: true,
                      StdinOnce: false,
                      Tty: false,
                      HostConfig: {
                          Binds: [`${cppFile}:/tmp/main.cpp`],
                          AutoRemove: true
                      }
                  };
                  break;

              case 'java':
                  const javaDir = path.join(__dirname, 'temp');
                  const javaFile = path.join(javaDir, 'Main.java');

                  // Đảm bảo thư mục temp tồn tại
                  await fs.mkdir(javaDir, { recursive: true });

                  console.log('[Java] Saving code to:', javaFile);
                  await fs.writeFile(javaFile, data.code);

                  // Kiểm tra và pull image Java nếu cần
                  const javaImage = 'openjdk:11';
                  if (!(await checkImageExists(javaImage))) {
                      console.log('[Docker] Java image not found, pulling...');
                      try {
                          await pullDockerImage(javaImage);
                      } catch (pullError) {
                          console.error('[Docker] Error pulling Java image:', pullError);
                          throw new Error('Không thể tải Java image. Vui lòng thử lại sau.');
                      }
                  }

                  console.log('[Docker] Creating Java container...');
                  containerConfig = {
                      Image: javaImage,
                      Cmd: ['/bin/bash', '-c', 'javac /tmp/Main.java && java -cp /tmp Main'],
                      AttachStdin: true,
                      AttachStdout: true,
                      AttachStderr: true,
                      OpenStdin: true,
                      StdinOnce: false,
                      Tty: false,
                      HostConfig: {
                          Binds: [`${javaFile}:/tmp/Main.java`],
                          AutoRemove: true
                      }
                  };
                  break;

              case 'csharp':
                  const csDir = path.join(__dirname, 'temp');
                  const csFile = path.join(csDir, 'Program.cs');

                  await fs.mkdir(csDir, { recursive: true });
                  console.log('[C#] Saving code to:', csFile);
                  await fs.writeFile(csFile, data.code);

                  const csDockerPath = csFile.replace(/\\/g, '/').replace(/^(\w):/, '//$1');
                  console.log('[Docker] Mount path:', csDockerPath);

                  // Kiểm tra và pull image .NET SDK nếu cần
                  const dotnetImage = 'mcr.microsoft.com/dotnet/sdk:6.0';
                  if (!(await checkImageExists(dotnetImage))) {
                      console.log('[Docker] .NET SDK image not found, pulling...');
                      try {
                          await pullDockerImage(dotnetImage);
                      } catch (pullError) {
                          console.error('[Docker] Error pulling .NET SDK image:', pullError);
                          throw new Error('Không thể tải .NET SDK image. Vui lòng thử lại sau.');
                      }
                  }

                  console.log('[Docker] Creating C# container...');
                  containerConfig = {
                      Image: dotnetImage,
                      Cmd: ['/bin/bash', '-c', `
                          set -e
                          echo "Setting up C# environment..."
                          cd /tmp
                          dotnet new console -n MyApp
                          cat > /tmp/MyApp/Program.cs << 'ENDOFFILE'
${data.code}
ENDOFFILE
                          cd MyApp
                          dotnet run
                      `],
                      AttachStdin: true,
                      AttachStdout: true,
                      AttachStderr: true,
                      OpenStdin: true,
                      StdinOnce: false,
                      Tty: false,
                      HostConfig: {
                          AutoRemove: true
                      }
                  };
                  break;
            case 'javascript':
            {
                const jsDir = path.join(__dirname, 'temp');
                const jsFile = path.join(jsDir, 'script.js');

                // Đảm bảo thư mục temp tồn tại
                await fs.mkdir(jsDir, { recursive: true });

                console.log('[JavaScript] Saving code to:', jsFile);
                await fs.writeFile(jsFile, data.code);
                containerConfig = {
                    Image: 'node:16-slim',
                    Cmd: ['node', '/temp/script.js'],
                    AttachStdin: true,
                    AttachStdout: true,
                    AttachStderr: true,
                    OpenStdin: true,
                    StdinOnce: false,
                    Tty: false,
                    HostConfig: {
                        Binds: [`${jsFile}:/script.js`],
                        AutoRemove: true
                    }
                };
                break;
            }



              default:
                  throw new Error('Ngôn ngữ không được hỗ trợ');
          }

          // Log trước khi tạo container
          console.log('[Docker] Container config:', JSON.stringify(containerConfig, null, 2));

          currentContainer = await docker.createContainer(containerConfig);
          console.log('[Docker] Container created');

          await currentContainer.start();
          console.log('[Docker] Container started');

          currentStream = await currentContainer.attach({
              stream: true,
              stdout: true,
              stderr: true,
              stdin: true,
              hijack: true
          });
          console.log('[Docker] Stream attached');

          // Xử lý output stream
          let buffer = '';
          currentContainer.modem.demuxStream(currentStream, {
              write: (chunk) => {
                  const output = chunk.toString();
                  console.log('[Output]:', output);

                  // Kiểm tra input prompt
                  if (output.includes('input(') || output.includes('Nhập')) {
                      console.log('[Stream] Input prompt detected');
                      isWaitingForInput = true;
                  }

                  // Gửi output về client
                  socket.emit('output', output);
              }
          }, {
              write: (chunk) => {
                  const error = chunk.toString();
                  console.error('[Error]:', error);
                  socket.emit('error', error);
              }
          });

      } catch (error) {
          console.error('[System Error]:', error);
          socket.emit('error', error.message);
      }
  });

  socket.on('input', (input) => {
      console.log('[Input] Received:', input);
      console.log('[Input] Waiting status:', isWaitingForInput);

      if (currentStream && isWaitingForInput) {
          try {
              console.log('[Input] Sending to container:', input);
              currentStream.write(input + '\n');
              isWaitingForInput = false;

              // Echo input về client
              socket.emit('output', input + '\n');

              console.log('[Input] Input sent successfully');
          } catch (error) {
              console.error('[Input Error]:', error);
              socket.emit('error', 'Không thể gửi input: ' + error.message);
          }
      } else {
          console.error('[Input Error] Not waiting for input or no active stream');
          socket.emit('error', 'Input không được chấp nhận tại thời điểm này');
      }
  });

  socket.on('disconnect', async () => {
      try {
          if (currentContainer) {
              console.log('[Cleanup] Stopping container...');
              try {
                  // Thêm timeout cho việc dừng container
                  await Promise.race([
                      currentContainer.stop(),
                      new Promise((_, reject) =>
                          setTimeout(() => reject(new Error('Timeout')), 5000)
                      )
                  ]);
              } catch (stopError) {
                  console.log('[Cleanup] Stop error:', stopError.message);
              }

              console.log('[Cleanup] Removing container...');
              try {
                  await currentContainer.remove({ force: true });
              } catch (removeError) {
                  if (!removeError.message.includes('already in progress')) {
                      console.error('[Cleanup] Remove error:', removeError.message);
                  }
              }
              currentContainer = null;
          }

          // Cleanup temp files
          try {
              const sqlFile = path.join(__dirname, 'temp/query.sql');
              await fs.unlink(sqlFile).catch(() => { });
          } catch (error) {
              console.error('[Cleanup] File error:', error.message);
          }
      } catch (error) {
          console.error('[Cleanup] General error:', error.message);
      }
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});