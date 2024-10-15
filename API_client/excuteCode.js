const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 4000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/execute') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
      const postData = JSON.parse(body);
    });

    req.on('end', () => {
      try {
        let postData = JSON.parse(body);
        
        // Check if required fields are present
        if (!postData.script || !postData.language) {
          throw new Error('Missing required fields: script and language must be provided');
        }

        // Add or overwrite necessary properties
        postData = {
          ...postData,
          clientId: "37b74c2b9f31a362ad8ecb4ecbb22441",
          clientSecret: "c01683242339952959b606fa035fbaeb59b6894fb11bf3dfa8415994c0b5ba0c",
        };

        console.log('Prepared postData:', postData);  // Log the prepared data for debugging

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
            const responseData = JSON.parse(data);
            
            if (responseData.error === "Daily limit reached" && responseData.statusCode === 429) {
              res.writeHead(429, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ 
                error: 'Đã đạt giới hạn số lần thực thi hàng ngày. Vui lòng thử lại sau.',
                statusCode: 429
              }));
            } else {
              res.writeHead(proxyRes.statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(data);
            }
          });
        });

        proxyReq.on('error', (error) => {
          console.error(error);
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ error: 'Lỗi khi thực thi mã' }));
        });

        proxyReq.write(JSON.stringify(postData));

        proxyReq.end();

      } catch (error) {
        console.error('Error processing request:', error.message);
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});