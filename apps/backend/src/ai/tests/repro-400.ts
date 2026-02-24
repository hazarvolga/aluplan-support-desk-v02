import * as http from 'http';

async function repro() {
    const payloads = [
        { key: 'ai.llmapi.api_key', value: 'test-key', isSecret: true },
    ];

    for (const payload of payloads) {
        const body = JSON.stringify(payload);
        console.log(`📡 Sending payload: ${body}`);

        const options = {
            hostname: 'localhost',
            port: 4000,
            path: '/api/v1/settings',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = http.request(options, (res) => {
            console.log(`HTTP ${res.statusCode} ${res.statusMessage}`);
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`Response: ${data}\n`);
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Request failed: ${e.message}`);
        });

        req.write(body);
        req.end();
    }
}

repro();
