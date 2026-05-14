const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/public/stats',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('状态码:', res.statusCode);
    console.log('响应数据:', data);
    const json = JSON.parse(data);
    console.log('gradeDistribution:', json.data.gradeDistribution);
    console.log('scoreDistribution:', json.data.scoreDistribution);
  });
});

req.on('error', (e) => {
  console.error('请求错误:', e.message);
});

req.end();
