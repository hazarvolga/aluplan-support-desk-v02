const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps/frontend/src');

function findTsxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findTsxFiles(filePath, fileList);
        } else if (filePath.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const tsxFiles = findTsxFiles(srcDir);
let report = '';
let totalCount = 0;

// simple regex to find text between > and <
// matches at least one Word character, allows spaces, punctuation
// excludes common code artifacts like {...}, &nbsp;, etc.
const jsxTextRegex = />\s*([^<>{$]+)\s*</g;

for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    let match;
    const foundStrings = new Set();

    while ((match = jsxTextRegex.exec(content)) !== null) {
        let text = match[1].trim();
        // filter out pure numbers, symbols, spaces, or single characters
        if (text.length > 2 && /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(text) && !/^[0-9\s\-_.,:;!/'"|\\+=\*&%()\[\]]+$/.test(text)) {
            // Check if it's likely just a code artifact or CSS class (e.g. text-sm, pt-4)
            if (!/^[a-z0-9\-]+$/.test(text)) {
                foundStrings.add(text);
            }
        }
    }

    if (foundStrings.size > 0) {
        const shortPath = file.replace(__dirname, '');
        report += `\n--- ${shortPath} ---\n`;
        foundStrings.forEach(s => {
            report += `  "${s}"\n`;
            totalCount++;
        });
    }
}

fs.writeFileSync('hardcoded-strings.txt', report);
console.log(`Found ~${totalCount} potential hardcoded strings. Results written to hardcoded-strings.txt`);
