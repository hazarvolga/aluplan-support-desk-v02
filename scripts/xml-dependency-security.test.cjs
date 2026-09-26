const assert = require('node:assert/strict');
const { existsSync, readFileSync, realpathSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');

// Explicit fixture anchor only; never select an arbitrary pnpm store version.
const packageJson = process.env.ALUPLAN_XML_PACKAGE_JSON
  || path.resolve(__dirname, '../apps/backend/package.json');
assert.ok(path.isAbsolute(packageJson));
assert.equal(path.basename(packageJson), 'package.json');
JSON.parse(readFileSync(packageJson, 'utf8'));
const backendRequire = createRequire(packageJson);
const parserEntry = backendRequire.resolve('fast-xml-parser');
const mammothEntry = backendRequire.resolve('mammoth');
const mammothRequire = createRequire(mammothEntry);
const domEntry = mammothRequire.resolve('@xmldom/xmldom');
const { XMLParser, XMLValidator, XMLBuilder } = require(parserEntry);
const { DOMImplementation, DOMParser, XMLSerializer } = require(domEntry);
const mammoth = require(mammothEntry);
const JSZip = mammothRequire('jszip');
const awsRequire = createRequire(backendRequire.resolve('@aws-sdk/client-s3'));
const awsXmlEntry = awsRequire.resolve('@aws-sdk/xml-builder');
const awsParserEntry = createRequire(awsXmlEntry).resolve('fast-xml-parser');
const storageRequire = createRequire(backendRequire.resolve('@google-cloud/storage'));
const storageParserEntry = storageRequire.resolve('fast-xml-parser');

function packageVersion(entry, name) {
  for (let directory = path.dirname(realpathSync(entry)); ; directory = path.dirname(directory)) {
    const file = path.join(directory, 'package.json');
    if (existsSync(file)) {
      const data = JSON.parse(readFileSync(file, 'utf8'));
      if (data.name === name) return data.version;
    }
    assert.notEqual(directory, path.dirname(directory), `Missing package identity: ${name}`);
  }
}

for (const [role, entry] of [['backend', parserEntry], ['AWS XML', awsParserEntry], ['Google storage', storageParserEntry]]) {
  test(`actual ${role} parser is patched within reviewed major 5`, (t) => {
    const version = packageVersion(entry, 'fast-xml-parser');
    t.diagnostic(`${role}: fast-xml-parser=${version}`);
    assert.match(version, /^5\.\d+\.\d+$/);
    const [, minor, patch] = version.split('.').map(Number);
    assert.ok(minor > 7 || (minor === 7 && patch >= 3), 'fast-xml-parser must be >=5.7.3 within major 5');
  });
}

test('actual mammoth XML dependency is patched within reviewed 0.8 line', (t) => {
  const version = packageVersion(domEntry, '@xmldom/xmldom');
  t.diagnostic(`mammoth=${packageVersion(mammothEntry, 'mammoth')}; xmldom=${version}`);
  assert.match(version, /^0\.8\.\d+$/);
  assert.ok(Number(version.split('.')[2]) >= 15, 'xmldom must be >=0.8.15 within 0.8');
});

test('actual parser builder is patched within reviewed major 1', (t) => {
  const entry = createRequire(parserEntry).resolve('fast-xml-builder');
  const version = packageVersion(entry, 'fast-xml-builder');
  t.diagnostic(`fast-xml-builder=${version}`);
  assert.match(version, /^1\.\d+\.\d+$/);
  const [, minor, patch] = version.split('.').map(Number);
  assert.ok(minor > 1 || (minor === 1 && patch >= 7), 'fast-xml-builder must be >=1.1.7 within major 1');
});

test('parser preserves Turkish text, attributes and ordinary XML entities', () => {
  const parsed = new XMLParser({ ignoreAttributes: false, htmlEntities: true }).parse(
    '<root label="Ölçü &amp; donatı"><text>Çağrı &lt;BIM&gt; &#351;</text><count>7</count></root>',
  );
  assert.deepEqual(parsed, { root: { '@_label': 'Ölçü & donatı', text: 'Çağrı <BIM> ş', count: 7 } });
  assert.notEqual(XMLValidator.validate('<root><child></root>'), true);
});

test('tiny numeric entities obey an explicitly bounded expansion limit', () => {
  const parser = new XMLParser({ htmlEntities: true, processEntities: { maxTotalExpansions: 10 } });
  assert.equal(parser.parse('<root>&#65;&#65;</root>').root, 'AA');
  assert.throws(() => parser.parse('<root>' + '&#65;'.repeat(20) + '</root>'), /[Ee]ntity.*[Ll]imit|[Ee]xpansion.*[Ll]imit/);
});

test('XMLBuilder preserves escaped attribute and text values on roundtrip', () => {
  const input = { root: { '@_label': 'Ölçü " & <safe>', '#text': 'Donatı & <BIM> ş' } };
  const xml = new XMLBuilder({ ignoreAttributes: false }).build(input);
  assert.equal(XMLValidator.validate(xml), true);
  assert.deepEqual(new XMLParser({ ignoreAttributes: false }).parse(xml), input);
});

test('AWS XML builder and actual parser preserve ordinary R2-style XML offline', () => {
  const { XmlNode, parseXML } = require(awsXmlEntry);
  const document = new XmlNode('CompleteMultipartUpload', [
    new XmlNode('Part', [XmlNode.of('PartNumber', '1'), XmlNode.of('ETag', 'Ölçü & <safe>')]),
  ]);
  const xml = document.toString();
  assert.ok(xml.includes('Ölçü &amp; &lt;safe&gt;'));
  const parsed = parseXML(xml);
  assert.equal(parsed.CompleteMultipartUpload.Part.ETag, 'Ölçü & <safe>');
  assert.equal(String(parsed.CompleteMultipartUpload.Part.PartNumber), '1');
  assert.equal(parseXML('<root><Key>first&#xD;&#10;second</Key></root>').root.Key, 'first\r\nsecond');
});

test('serializer preserves escaped attribute and text values', () => {
  const document = new DOMParser().parseFromString('<root/>', 'text/xml');
  document.documentElement.setAttribute('label', '\"><unexpected/> & ölçü');
  document.documentElement.appendChild(document.createTextNode('<BIM> & ş'));
  const xml = new XMLSerializer().serializeToString(document, null, null, { requireWellFormed: true });
  const parsed = new DOMParser().parseFromString(xml, 'text/xml');
  assert.equal(parsed.getElementsByTagName('unexpected').length, 0);
  assert.equal(parsed.documentElement.getAttribute('label'), '\"><unexpected/> & ölçü');
  assert.equal(parsed.documentElement.textContent, '<BIM> & ş');
});

test('well-formed serializer rejects inert comment injection through doctype name', () => {
  // GHSA-27p8-2357-5qqv: tiny inert comment, no script/browser/network execution.
  // Protection is opt-in; this is not a claim that Mammoth serializes doctypes.
  const implementation = new DOMImplementation();
  const doctype = implementation.createDocumentType('root><!--synthetic--', '', '');
  const document = implementation.createDocument(null, 'root', doctype);
  assert.throws(() => new XMLSerializer().serializeToString(document, null, null, { requireWellFormed: true }));
});

test('Mammoth preserves Turkish text in a tiny in-memory DOCX without external files', { timeout: 2000 }, async () => {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/document.xml', '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Ölçü &amp; donatı: Çağrı, ş, ğ, ü, ı.</w:t></w:r></w:p></w:body></w:document>');
  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
  assert.ok(buffer.length < 4096);
  const result = await mammoth.extractRawText({ buffer }, { externalFileAccess: false });
  assert.equal(result.value, 'Ölçü & donatı: Çağrı, ş, ğ, ü, ı.\n\n');
  assert.deepEqual(result.messages, []);
});
