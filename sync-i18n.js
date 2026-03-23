const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'apps/frontend/messages');

const trRaw = JSON.parse(fs.readFileSync(path.join(basePath, 'tr.json'), 'utf-8'));
const enRaw = JSON.parse(fs.readFileSync(path.join(basePath, 'en.json'), 'utf-8'));
const deRaw = JSON.parse(fs.readFileSync(path.join(basePath, 'de.json'), 'utf-8'));

// Helper to get nested value
function getValue(obj, keyPath) {
    return keyPath.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

// Build a flat dictionary of EN and DE
function flatten(obj, prefix = '', res = {}) {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            flatten(obj[key], `${prefix}${key}.`, res);
        } else {
            res[`${prefix}${key}`] = obj[key];
        }
    }
    return res;
}

const enFlat = flatten(enRaw);
const deFlat = flatten(deRaw);

// Reconstruct perfectly matching TR structure
function syncNode(trNode, currentPath = '') {
    if (typeof trNode === 'string') {
        const enVal = enFlat[currentPath] || enFlat['settings.' + currentPath] || `[TR] ${trNode}`;
        const deVal = deFlat[currentPath] || deFlat['settings.' + currentPath] || `[TR] ${trNode}`;
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

console.log('Successfully synchronized en.json and de.json with tr.json hierarchy.');
