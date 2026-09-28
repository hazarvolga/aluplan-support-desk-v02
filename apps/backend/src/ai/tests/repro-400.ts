import * as http from 'http';
import { createCliLogger } from '../../common/utils/cli-logger';

const cliLogger = createCliLogger('Repro400');

async function repro() {
    const payloads = [
        { key: 'ai.llmapi.api_key', value: 'test-key', isSecret: true },
    ];

    for (const payload of payloads) {
        const body = JSON.stringify(payload);
        cliLogger.log(`📡 Sending payload: ${body}`);

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
            cliLogger.log(`HTTP ${res.statusCode} ${res.statusMessage}`);
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                cliLogger.log(`Response: ${data}\n`);
            });
        });

        req.on('error', (e) => {
            cliLogger.error(`❌ Request failed: ${e.message}`);
        });

        req.write(body);
        req.end();
    }
}

repro();
