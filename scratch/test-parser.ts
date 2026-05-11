import { HotinfoParserService } from './apps/backend/src/customers/hotinfo-parser.service';
import * as fs from 'fs';

const service = new HotinfoParserService();
const xml = fs.readFileSync('./_hotinf_.hxl', 'utf-8');
const result = service.parseHotinfo(xml);
console.log(JSON.stringify(result, null, 2));
