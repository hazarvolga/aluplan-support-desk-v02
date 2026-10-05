const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

for (const [locale, expected] of Object.entries({ tr: 'Yapay Zeka Taslağı', en: 'AI Draft Reply', de: 'KI-Antwortentwurf' })) {
    test(`${locale} ticket AI action uses the approved response label`, () => {
        const messages = JSON.parse(readFileSync(join(__dirname, '../messages', `${locale}.json`), 'utf8'));
        assert.equal(messages.tickets.detail.ai_draft_btn, expected);
    });
}
