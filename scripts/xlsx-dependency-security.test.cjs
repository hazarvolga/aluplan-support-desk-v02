const assert = require('node:assert/strict');
const { readFileSync, realpathSync } = require('node:fs');
const { createRequire, Module } = require('node:module');
const path = require('node:path');
const test = require('node:test');

const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const xlsx = backend('xlsx');
const JSZip = createRequire(backend.resolve('mammoth'))('jszip');
const ts = backend('typescript');
const servicePath = path.resolve(__dirname, '../apps/backend/src/common/services/document-parser.service.ts');
const source = readFileSync(servicePath, 'utf8');
// Load only the real service with its real dependencies; no Nest app, DB or mocks.
const compiled = ts.transpileModule(source, {
    fileName: servicePath,
    compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
        experimentalDecorators: true, esModuleInterop: true,
    },
}).outputText;
const serviceModule = new Module(servicePath, module);
serviceModule.filename = servicePath;
serviceModule.paths = Module._nodeModulePaths(path.dirname(servicePath));
serviceModule._compile(compiled, servicePath);
const { DocumentParserService } = serviceModule.exports;
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const XLS_MIME = 'application/vnd.ms-excel';
const TRUNCATION = '... [METİN ÇOK UZUN OLDUĞU İÇİN KESİLDİ - SADECE İLK KISIM GöSTERİLMEKTEDİR]';

test('official CDN dependency retains the independently measured archive integrity', () => {
    const url = 'https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz';
    const manifest = JSON.parse(readFileSync(path.resolve(__dirname, '../apps/backend/package.json'), 'utf8'));
    assert.equal(manifest.dependencies.xlsx, url);
    const lock = readFileSync(path.resolve(__dirname, '../pnpm-lock.yaml'), 'utf8');
    const marker = `  xlsx@${url}:\n`;
    const start = lock.indexOf(marker);
    assert.ok(start >= 0);
    const resolution = lock.slice(start + marker.length).split('\n')[0];
    assert.ok(resolution.includes('integrity: sha512-oLDq3jw7AcLqKWH2AhCpVTZl8mf6X2YReP+Neh0SJUzV/BdZYjth94tG5toiMB1PPrYtxOCfaoUCkvtuH+3AJA=='));
    assert.ok(resolution.includes(`tarball: ${url}`));
});

function workbookBytes(bookType, sheets) {
    const workbook = {
        SheetNames: sheets.map(([name]) => name),
        Sheets: Object.fromEntries(sheets),
    };
    const bytes = xlsx.write(workbook, { type: 'buffer', bookType, compression: false });
    assert.ok(Buffer.isBuffer(bytes));
    assert.ok(bytes.length < 64 * 1024, 'Keep each synthetic workbook below 64 KiB');
    return bytes;
}

test('backend resolves the reviewed official SheetJS 0.20.3 release', t => {
    t.diagnostic(`backend SheetJS entry: ${backend.resolve('xlsx')}`);
    const metadata = JSON.parse(readFileSync(path.join(path.dirname(realpathSync(backend.resolve('xlsx'))), 'package.json'), 'utf8'));
    assert.equal(metadata.name, 'xlsx');
    assert.equal(metadata.version, '0.20.3');
    assert.equal(xlsx.version, '0.20.3');
});

test('real parser reads independent OOXML Turkish cells and the cached formula value', { timeout: 3000 }, async () => {
    // Build a tiny ordinary ZIP directly, independent of the SheetJS writer.
    const zip = new JSZip();
    const xml = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    const rel = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
    zip.file('_rels/.rels', `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
    zip.file('xl/workbook.xml', `<workbook xmlns="${xml}" xmlns:r="${rel}"><sheets><sheet name="Ölçüler" sheetId="1" r:id="rId1"/><sheet name="Notlar" sheetId="2" r:id="rId2"/></sheets></workbook>`);
    zip.file('xl/_rels/workbook.xml.rels', `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${rel}/worksheet" Target="worksheets/sheet2.xml"/></Relationships>`);
    zip.file('xl/worksheets/sheet1.xml', `<worksheet xmlns="${xml}"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Ölçü &amp; çizim şğüıöç</t></is></c><c r="B1"><v>42.5</v></c><c r="C1" t="b"><v>1</v></c><c r="D1"><f>1+1</f><v>73</v></c></row></sheetData></worksheet>`);
    zip.file('xl/worksheets/sheet2.xml', `<worksheet xmlns="${xml}"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Çağrı İstanbul</t></is></c><c r="B1" t="b"><v>0</v></c></row></sheetData></worksheet>`);
    const bytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
    assert.ok(bytes.length < 8192);
    const result = await new DocumentParserService().extractText(XLSX_MIME, bytes);
    assert.equal(result, '--- Sheet: Ölçüler --- Ölçü & çizim şğüıöç,42.5,TRUE,73 --- Sheet: Notlar --- Çağrı İstanbul,FALSE');
});

for (const [bookType, mimeType] of [['xlsx', XLSX_MIME], ['biff8', XLS_MIME]]) {
    test(`real parser extracts Turkish multi-sheet ${bookType} values and cached numeric output`, { timeout: 3000 }, async () => {
        const rows = xlsx.utils.aoa_to_sheet([
            ['Başlık', 'Sayı', 'Onay', 'Önbellek'],
            ['Ölçü & çizim şğüıöç', 42.5, true, 73],
            ['İkinci satır', 0, false, null],
        ]);
        const sheet = { ...rows, D2: { t: 'n', f: '1+1', v: 73 } };
        const bytes = workbookBytes(bookType, [
            ['Ölçüler', sheet], ['Notlar', xlsx.utils.aoa_to_sheet([['Çağrı', 'İstanbul']])],
        ]);
        // XLSX stores both formula and a deliberately different cached value.
        // BIFF8 writing may retain only the cached value; no formula engine runs.
        if (bookType === 'xlsx') {
            const cell = xlsx.read(bytes, { type: 'buffer' }).Sheets['Ölçüler'].D2;
            assert.equal(cell.f, '1+1');
            assert.equal(cell.v, 73);
        }
        const result = await new DocumentParserService().extractText(mimeType, bytes);
        assert.equal(result, '--- Sheet: Ölçüler --- Başlık,Sayı,Onay,Önbellek Ölçü & çizim şğüıöç,42.5,TRUE,73 İkinci satır,0,FALSE, --- Sheet: Notlar --- Çağrı,İstanbul');
    });
}

test('real spreadsheet parser retains the existing 10000-character output truncation', { timeout: 3000 }, async () => {
    const text = 'Ş'.repeat(11000);
    const bytes = workbookBytes('xlsx', [['Uzun', xlsx.utils.aoa_to_sheet([[text]])]]);
    const result = await new DocumentParserService().extractText(XLSX_MIME, bytes);
    const fullText = `--- Sheet: Uzun --- ${text}`;
    assert.equal(result, fullText.substring(0, 10000) + TRUNCATION);
    assert.equal(result.length, 10000 + TRUNCATION.length);
    // This checks output compatibility, not a parsing resource/ZIP-bomb limit.
});

test('real parser returns null for a bounded incomplete ZIP workbook', { timeout: 3000 }, async () => {
    const bytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);
    assert.equal(bytes.length, 8);
    const result = await new DocumentParserService().extractText(XLSX_MIME, bytes);
    assert.equal(result, null);
});
