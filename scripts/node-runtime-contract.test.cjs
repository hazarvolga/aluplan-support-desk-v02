const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Source contract only: actual image/runtime compatibility is verified separately.
const image = 'node:22.23.3-alpine3.23@sha256:baf676f7d0e552f3231945c2f979055ca121bce128c152f7a34e6bd1728b1c5a';

for (const app of ['backend', 'frontend']) {
    test(`${app} base and runner use the exact reviewed Node 22 image`, () => {
        const source = readFileSync(path.resolve(__dirname, `../apps/${app}/Dockerfile`), 'utf8');
        const from = source.replace(/\\\r?\n\s*/g, ' ').split(/\r?\n/)
            .map(line => line.trim()).filter(line => /^FROM\s/i.test(line));
        assert.deepEqual(from, [
            `FROM ${image} AS base`,
            'FROM base AS builder',
            `FROM ${image} AS runner`,
        ]);
    });
}

for (const workflow of ['ci', 'backend-test', 'frontend-test', 'ai-eval', 'dr-drill']) {
    test(`${workflow} CI jobs select Node 22.23.3`, () => {
        const source = readFileSync(path.resolve(__dirname, `../.github/workflows/${workflow}.yml`), 'utf8');
        const versions = [...source.matchAll(/^\s*node-version:\s*(.*?)\s*$/gm)].map(match => match[1]);
        const setups = [...source.matchAll(/\buses:\s*actions\/setup-node@/g)];
        assert.ok(setups.length > 0);
        assert.equal(versions.length, setups.length);
        if (workflow === 'ci') {
            const env = [...source.matchAll(/^\s*NODE_VERSION:\s*(.*?)\s*$/gm)].map(match => match[1]);
            assert.equal(env.length, 1);
            assert.match(env[0], /^(?:22\.23\.3|'22\.23\.3'|"22\.23\.3")$/);
            for (const version of versions) assert.equal(version, '${{ env.NODE_VERSION }}');
        } else {
            for (const version of versions) assert.match(version, /^(?:22\.23\.3|'22\.23\.3'|"22\.23\.3")$/);
        }
    });
}
