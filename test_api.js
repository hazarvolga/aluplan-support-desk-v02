const http = require('http');

const data = JSON.stringify({
    query: "Merhabalar yeni bir pafta çerçevesi oluşturmak istiyorum. Hazır şablonlar kenar genişlikleri istediğim gibi ayarlayamıyorum. Yenisini nasıl oluşturabilirim. yada mevcut paftaların kenar kalınlıklarını nasıl değiştirebilirim."
});

const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: '/api/v1/ai/query',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('BODY:', body));
});

req.on('error', e => console.error(`Problem with request: ${e.message}`));

req.write(data);
req.end();
