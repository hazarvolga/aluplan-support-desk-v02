import fs from 'fs';
import path from 'path';

const REPO = '/Users/hazarekiz/Projects/aluplan-support-desk-V02';
const docTreePath = path.join(REPO, 'apps/frontend/src/components/help/doc-tree.ts');
const enJsonPath = path.join(REPO, 'apps/frontend/messages/en.json');
const trJsonPath = path.join(REPO, 'apps/frontend/messages/tr.json');

// 1. Rewrite doc-tree.ts
let docTree = fs.readFileSync(docTreePath, 'utf8');

// Replace labelKeys
docTree = docTree.replace(/labelKey: 'help\.docs\.nav\.customer_(.*?)'/g, "labelKey: 'help.docs.nav.customer.$1'");
docTree = docTree.replace(/labelKey: 'help\.docs\.nav\.admin_(.*?)'/g, "labelKey: 'help.docs.nav.admin.$1'");

// Replace contentKeys
docTree = docTree.replace(/contentKey: 'help\.docs\.customer_(.*?)'/g, "contentKey: 'help.docs.customer.$1'");
docTree = docTree.replace(/contentKey: 'help\.docs\.admin_(.*?)'/g, "contentKey: 'help.docs.admin.$1'");

fs.writeFileSync(docTreePath, docTree);

// 2. Rewrite en.json and tr.json
function rewriteJson(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  if (data.help && data.help.docs) {
    const docs = data.help.docs;
    
    // Fix nav
    if (docs.nav) {
      const newNav = { customer: {}, admin: {} };
      for (const [key, value] of Object.entries(docs.nav)) {
        if (key.startsWith('customer_')) {
          newNav.customer[key.replace('customer_', '')] = value;
        } else if (key.startsWith('admin_')) {
          newNav.admin[key.replace('admin_', '')] = value;
        } else {
          newNav[key] = value; // Keep others if any
        }
      }
      docs.nav = newNav;
    }
    
    // Fix content (customer)
    if (docs.customer) {
      const newCustomer = {};
      for (const [key, value] of Object.entries(docs.customer)) {
        // Some might already be correct or just need restructuring
        if (key === 'getting_started' || key === 'dashboard' || key.includes('section')) {
           newCustomer[key] = value;
        } else {
           newCustomer[key] = value;
        }
      }
      docs.customer = newCustomer;
    }
    
    // Fix content (admin_guide -> admin)
    if (docs.admin_guide) {
      docs.admin = docs.admin_guide;
      delete docs.admin_guide;
    }
  }
  
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n');
}

rewriteJson(enJsonPath);
rewriteJson(trJsonPath);

console.log("Refactoring complete");
