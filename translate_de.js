import fs from 'fs';
import path from 'path';

const REPO = '/Users/hazarekiz/Projects/aluplan-support-desk-V02';
const enJsonPath = path.join(REPO, 'apps/frontend/messages/en.json');
const deJsonPath = path.join(REPO, 'apps/frontend/messages/de.json');

const enData = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
const deData = JSON.parse(fs.readFileSync(deJsonPath, 'utf8'));

if (!deData.help) deData.help = {};
deData.help.docs = JSON.parse(JSON.stringify(enData.help.docs));

// Very basic German translations for navigation (better than English)
function translateDeObj(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      let text = obj[key];
      // Nav translations
      text = text.replace(/Getting Started/g, 'Erste Schritte');
      text = text.replace(/Dashboard/g, 'Dashboard');
      text = text.replace(/Announcements/g, 'Ankündigungen');
      text = text.replace(/AI Assistant/g, 'KI-Assistent');
      text = text.replace(/Overview/g, 'Übersicht');
      text = text.replace(/Tips/g, 'Tipps');
      text = text.replace(/My Tickets/g, 'Meine Tickets');
      text = text.replace(/Create Ticket/g, 'Ticket erstellen');
      text = text.replace(/Attachments/g, 'Anhänge');
      text = text.replace(/Tracking/g, 'Verfolgung');
      text = text.replace(/Knowledge Base/g, 'Wissensdatenbank');
      text = text.replace(/Profile/g, 'Profil');
      text = text.replace(/Settings/g, 'Einstellungen');
      
      text = text.replace(/Tickets/g, 'Tickets');
      text = text.replace(/AI Copilot/g, 'KI-Copilot');
      text = text.replace(/Internal Notes/g, 'Interne Notizen');
      text = text.replace(/AI Knowledge/g, 'KI-Wissen');
      text = text.replace(/Knowledge Pool/g, 'Wissenspool');
      text = text.replace(/Learning Cycle/g, 'Lernzyklus');
      text = text.replace(/Approvals/g, 'Genehmigungen');
      text = text.replace(/FAQ/g, 'Häufig gestellte Fragen');
      text = text.replace(/Products/g, 'Produkte');
      text = text.replace(/Taxonomy/g, 'Taxonomie');
      text = text.replace(/Customers/g, 'Kunden');
      text = text.replace(/Teams/g, 'Teams');
      text = text.replace(/SLA Settings/g, 'SLA-Einstellungen');
      text = text.replace(/Templates/g, 'Vorlagen');
      text = text.replace(/System Settings/g, 'Systemeinstellungen');
      text = text.replace(/Topology/g, 'Topologie');

      obj[key] = text;
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      translateDeObj(obj[key]);
    }
  }
}

translateDeObj(deData.help.docs);

fs.writeFileSync(deJsonPath, JSON.stringify(deData, null, 2) + '\n');
console.log('Translated de.json successfully.');
