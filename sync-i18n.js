const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'apps/frontend/messages');

const trRaw = JSON.parse(fs.readFileSync(path.join(basePath, 'tr.json'), 'utf-8'));
const enRaw = JSON.parse(fs.readFileSync(path.join(basePath, 'en.json'), 'utf-8'));
const deRaw = JSON.parse(fs.readFileSync(path.join(basePath, 'de.json'), 'utf-8'));

// Build a flat dictionary
function flatten(obj, prefix = '', res = {}) {
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            flatten(obj[key], fullKey, res);
        } else {
            res[fullKey] = obj[key];
        }
    }
    return res;
}

const enFlat = flatten(enRaw);
const deFlat = flatten(deRaw);

let missingEnCount = 0;
let missingDeCount = 0;

// Reconstruct matching TR structure
function syncNode(trNode, currentPath = '') {
    if (typeof trNode === 'string') {
        let enVal = enFlat[currentPath];
        let deVal = deFlat[currentPath];

        if (!enVal) {
            enVal = `[TR] ${trNode}`;
            missingEnCount++;
        }
        if (!deVal) {
            deVal = `[TR] ${trNode}`;
            missingDeCount++;
        }
        return { en: enVal, de: deVal };
    }

    const enObj = {};
    const deObj = {};

    for (const key in trNode) {
        const nextPath = currentPath ? `${currentPath}.${key}` : key;
        const synced = syncNode(trNode[key], nextPath);
        enObj[key] = synced.en;
        deObj[key] = synced.de;
    }

    return { en: enObj, de: deObj };
}

const synced = syncNode(trRaw);

fs.writeFileSync(path.join(basePath, 'en.json'), JSON.stringify(synced.en, null, 2));
fs.writeFileSync(path.join(basePath, 'de.json'), JSON.stringify(synced.de, null, 2));

console.log('✅ i18n Synchronization Complete:');
console.log(`- English: ${missingEnCount} missing keys patched.`);
console.log(`- German: ${missingDeCount} missing keys patched.`);
console.log(`- Files written to ${basePath}`);
