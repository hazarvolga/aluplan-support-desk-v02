/**
 * RSC Audit Script
 * 
 * Scans the Next.js app directory for 'use client' directives,
 * categorizes them, and generates a health report.
 * 
 * Run: npx ts-node scripts/rsc-audit.ts
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(__dirname, '../src/app');
const COMPONENTS_DIR = join(__dirname, '../src/components');

interface RscAuditResult {
  file: string;
  type: 'page' | 'layout' | 'component';
  hasUseClient: boolean;
  lineCount: number;
}

function walkDir(dir: string, baseDir: string, results: RscAuditResult[] = []): RscAuditResult[] {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath, baseDir, results);
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      const content = readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      const hasUseClient = lines.some(line => line.trim() === "'use client'" || line.trim() === '"use client"');
      
      let type: RscAuditResult['type'] = 'component';
      if (entry === 'page.tsx' || entry === 'page.ts') type = 'page';
      else if (entry === 'layout.tsx' || entry === 'layout.ts') type = 'layout';
      
      results.push({
        file: relative(baseDir, fullPath),
        type,
        hasUseClient,
        lineCount: lines.length,
      });
    }
  }
  
  return results;
}

function main() {
  console.log('🔍 Running RSC Audit...\n');
  
  const appResults = walkDir(APP_DIR, APP_DIR);
  const componentResults = walkDir(COMPONENTS_DIR, COMPONENTS_DIR);
  const allResults = [...appResults, ...componentResults];
  
  const pagesWithUseClient = appResults.filter(r => r.type === 'page' && r.hasUseClient);
  const layoutsWithUseClient = appResults.filter(r => r.type === 'layout' && r.hasUseClient);
  const componentsWithUseClient = allResults.filter(r => r.hasUseClient);
  
  console.log(`📊 Total files scanned: ${allResults.length}`);
  console.log(`   - Pages: ${appResults.filter(r => r.type === 'page').length}`);
  console.log(`   - Layouts: ${appResults.filter(r => r.type === 'layout').length}`);
  console.log(`   - Components: ${allResults.filter(r => r.type === 'component').length}`);
  console.log();
  
  console.log(`🎯 Files with 'use client': ${componentsWithUseClient.length}`);
  console.log(`   - Page-level: ${pagesWithUseClient.length}`);
  console.log(`   - Layout-level: ${layoutsWithUseClient.length}`);
  console.log(`   - Component-level: ${componentsWithUseClient.filter(r => r.type === 'component').length}`);
  console.log();
  
  if (pagesWithUseClient.length > 0) {
    console.log('⚠️  WARNING: Pages should not use "use client":');
    pagesWithUseClient.forEach(p => console.log(`   - ${p.file}`));
    console.log();
  }
  
  if (layoutsWithUseClient.length > 0) {
    console.log('⚠️  WARNING: Layouts should not use "use client":');
    layoutsWithUseClient.forEach(l => console.log(`   - ${l.file}`));
    console.log();
  }
  
  // Score calculation
  const totalPages = appResults.filter(r => r.type === 'page').length;
  const score = totalPages > 0 
    ? Math.round(((totalPages - pagesWithUseClient.length) / totalPages) * 100)
    : 100;
  
  const grade = score >= 95 ? 'A' : score >= 85 ? 'B' : score >= 70 ? 'C' : 'D';
  
  console.log(`🏆 RSC Score: ${score}/100 (Grade ${grade})`);
  
  if (pagesWithUseClient.length === 0 && layoutsWithUseClient.length === 0) {
    console.log('✅ No page-level or layout-level "use client" directives found.');
  }
  
  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: allResults.length,
      useClientCount: componentsWithUseClient.length,
      pageLevelCount: pagesWithUseClient.length,
      layoutLevelCount: layoutsWithUseClient.length,
      score,
      grade,
    },
    details: allResults.filter(r => r.hasUseClient),
  };
  
  const reportPath = join(__dirname, '../rsc-audit-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📝 Report written to: ${reportPath}`);
}

main();
