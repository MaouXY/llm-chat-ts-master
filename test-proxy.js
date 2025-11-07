const http = require('http');

// 创建一个简单的测试服务器在8080端口
const server = http.createServer((req, res) => {
    console.log(`收到请求: ${req.method} ${req.url}`);
    
    if (req.url === '/child/login' && req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            code: 0,
            msg: '测试成功！代理配置正确',
            data: { token: 'test-token-123' }
        }));
    } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            code: 0,
            msg: '服务器运行正常',
            data: { path: req.url }
        }));
    }
});

server.listen(8080, () => {
    console.log('测试服务器运行在 http://localhost:8080');
    console.log('现在您可以在前端测试登录功能了！');
});