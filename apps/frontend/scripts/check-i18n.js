const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../messages');
const locales = ['tr', 'en', 'de'];

function getKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
        } else {
            keys.push(prefix + key);
        }
    }
    return keys;
}

const allMessages = {};
locales.forEach(locale => {
    const filePath = path.join(messagesDir, `${locale}.json`);
    if (fs.existsSync(filePath)) {
        allMessages[locale] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
});

const allKeysPerLocale = {};
locales.forEach(locale => {
    if (allMessages[locale]) {
        allKeysPerLocale[locale] = new Set(getKeys(allMessages[locale]));
    }
});

const unionOfAllKeys = new Set();
locales.forEach(locale => {
    if (allKeysPerLocale[locale]) {
        allKeysPerLocale[locale].forEach(key => unionOfAllKeys.add(key));
    }
});

console.log('--- i18n Integrity Check ---');
locales.forEach(locale => {
    if (!allKeysPerLocale[locale]) {
        console.log(`[${locale}] skipped (file missing)`);
        return;
    }

    const missing = [];
    unionOfAllKeys.forEach(key => {
        if (!allKeysPerLocale[locale].has(key)) {
            missing.push(key);
        }
    });

    if (missing.length === 0) {
        console.log(`✅ [${locale}] is complete.`);
    } else {
        console.log(`❌ [${locale}] is missing ${missing.length} keys:`);
        missing.sort().forEach(k => console.log(`   - ${k}`));
    }
});
