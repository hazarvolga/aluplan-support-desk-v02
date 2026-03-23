const fs = require('fs');
const path = require('path');

const locales = ['en', 'tr', 'de'];
const basePath = path.join(__dirname, 'apps/frontend/messages');

const dicts = {};

locales.forEach(loc => {
    try {
        const fileContent = fs.readFileSync(path.join(basePath, `${loc}.json`), 'utf-8');
        dicts[loc] = JSON.parse(fileContent);
    } catch (e) {
        console.error(`Could not read/parse ${loc}.json:`, e);
    }
});

function getKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getKeys(obj[key], `${prefix}${key}.`));
        } else {
            keys.push(`${prefix}${key}`);
        }
    }
    return keys;
}

const keysEn = new Set(getKeys(dicts['en'] || {}));
const keysTr = new Set(getKeys(dicts['tr'] || {}));
const keysDe = new Set(getKeys(dicts['de'] || {}));

let out = '';

out += '--- Missing in EN (but exists in TR) ---\n';
keysTr.forEach(key => { if (!keysEn.has(key)) out += key + '\n'; });

out += '\n--- Missing in DE (but exists in TR) ---\n';
keysTr.forEach(key => { if (!keysDe.has(key)) out += key + '\n'; });

out += '\n--- Missing in TR (but exists in EN) ---\n';
keysEn.forEach(key => { if (!keysTr.has(key)) out += key + '\n'; });

fs.writeFileSync('missing-i18n.txt', out);
console.log('Results written to missing-i18n.txt');
