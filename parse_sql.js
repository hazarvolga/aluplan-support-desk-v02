const fs = require('fs');

const sql = fs.readFileSync('wordpress_1_2025-09-23_13-22-07.sql', 'utf8');

const customers = new Map(); // email -> name

// parse TTKsK_users
// pattern: INSERT INTO `TTKsK_users` VALUES (1,'hazarvolga','$P$BDd...',... 'hazarvolga@gmail.com', ...
const usersMatches = sql.match(/INSERT INTO `TTKsK_users` VALUES \((.*?)\);/g);
if (usersMatches) {
  for (const match of usersMatches) {
    // split by ),( to get individual rows
    let content = match.replace(/INSERT INTO `TTKsK_users` VALUES \(/, '').slice(0, -2);
    // basic split by regex (rough)
    // Actually regex for CSV rows is hard, let's just use string parsing
    
    // Instead, let's extract emails directly
    // This is safer: look for emails and names
  }
}

// Extract emails from TTKsK_psmsc_customers
const psmscMatches = sql.match(/INSERT INTO `TTKsK_psmsc_customers` VALUES (.*);/g);
if (psmscMatches) {
  let content = psmscMatches[0].replace(/INSERT INTO `TTKsK_psmsc_customers` VALUES \(/, '').slice(0, -2);
  const rows = content.split(/\),\(/);
  
  for (const row of rows) {
    // example row: 1,1,2,'hazarvolga','hazarvolga@gmail.com'
    const parts = row.match(/'([^']+)'/g);
    if (parts && parts.length >= 2) {
      const name = parts[0].replace(/'/g, '');
      const email = parts[1].replace(/'/g, '');
      if (email.includes('@')) {
        customers.set(email.toLowerCase(), name);
      }
    }
  }
}

console.log(`Found ${customers.size} unique customers from SupportCandy table.`);
