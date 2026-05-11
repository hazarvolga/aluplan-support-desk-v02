import fs from 'fs';
import path from 'path';

const REPO = '/Users/hazarekiz/Projects/aluplan-support-desk-V02';
const enJsonPath = path.join(REPO, 'apps/frontend/messages/en.json');
const trJsonPath = path.join(REPO, 'apps/frontend/messages/tr.json');

const enData = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));
const trData = JSON.parse(fs.readFileSync(trJsonPath, 'utf8'));

if (!trData.help) trData.help = {};
trData.help.docs = JSON.parse(JSON.stringify(enData.help.docs));

// Simple recursive translation
function translateObj(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      let text = obj[key];
      // Nav translations
      text = text.replace(/Getting Started/g, 'Başlarken');
      text = text.replace(/Dashboard/g, 'Kontrol Paneli');
      text = text.replace(/Announcements/g, 'Duyurular');
      text = text.replace(/AI Assistant/g, 'Yapay Zeka Asistanı');
      text = text.replace(/Overview/g, 'Genel Bakış');
      text = text.replace(/Tips/g, 'İpuçları');
      text = text.replace(/My Tickets/g, 'Taleplerim');
      text = text.replace(/Create Ticket/g, 'Talep Oluştur');
      text = text.replace(/Attachments/g, 'Ekler');
      text = text.replace(/Tracking/g, 'Takip');
      text = text.replace(/Knowledge Base/g, 'Bilgi Bankası');
      text = text.replace(/Profile/g, 'Profil');
      text = text.replace(/Settings/g, 'Ayarlar');
      
      text = text.replace(/Tickets/g, 'Talepler');
      text = text.replace(/AI Copilot/g, 'AI Copilot');
      text = text.replace(/Internal Notes/g, 'İç Notlar');
      text = text.replace(/AI Knowledge/g, 'Yapay Zeka Bilgi Seti');
      text = text.replace(/Knowledge Pool/g, 'Bilgi Havuzu');
      text = text.replace(/Learning Cycle/g, 'Öğrenme Döngüsü');
      text = text.replace(/Approvals/g, 'Onaylar');
      text = text.replace(/FAQ/g, 'Sıkça Sorulan Sorular');
      text = text.replace(/Products/g, 'Ürünler');
      text = text.replace(/Taxonomy/g, 'Taksonomi');
      text = text.replace(/Customers/g, 'Müşteriler');
      text = text.replace(/Teams/g, 'Ekipler');
      text = text.replace(/SLA Settings/g, 'SLA Ayarları');
      text = text.replace(/Templates/g, 'Şablonlar');
      text = text.replace(/System Settings/g, 'Sistem Ayarları');
      text = text.replace(/Topology/g, 'Topoloji');
      
      // Content translations
      text = text.replace(/The first screen you see when you log in is the Dashboard/g, 'Giriş yaptığınızda gördüğünüz ilk ekran Kontrol Paneli\'dir');
      text = text.replace(/It lets you track all your support activities at a glance./g, 'Tüm destek aktivitelerinizi bir bakışta takip etmenizi sağlar.');
      text = text.replace(/What is the Dashboard\?/g, 'Kontrol Paneli Nedir?');
      text = text.replace(/The Dashboard is the main control panel that summarizes all your activities on the platform/g, 'Kontrol paneli platformdaki tüm aktivitelerinizi özetleyen ana yönetim panelidir');
      text = text.replace(/My Active Support Requests/g, 'Aktif Destek Taleplerim');
      text = text.replace(/The Active Requests card on the Dashboard lists all your support requests that are awaiting a response or in progress./g, 'Kontrol Panelindeki Aktif Talepler kartı, yanıt bekleyen veya devam eden tüm destek taleplerinizi listeler.');
      text = text.replace(/The My Support Requests link in the left menu takes you directly to the page listing all your requests./g, 'Sol menüdeki Destek Taleplerim bağlantısı sizi doğrudan tüm taleplerinizi listeleyen sayfaya götürür.');
      text = text.replace(/Follow maintenance notifications, new feature announcements, and important updates sent by the Aluplan support team from this page./g, 'Aluplan destek ekibi tarafından gönderilen bakım bildirimlerini, yeni özellik duyurularını ve önemli güncellemeleri bu sayfadan takip edin.');
      text = text.replace(/How Do I See Announcements\?/g, 'Duyuruları Nasıl Görürüm?');
      text = text.replace(/Important maintenance notifications are also sent by email. Check the Profile & Settings page to make sure your email address is up to date./g, 'Önemli bakım bildirimleri ayrıca e-posta ile gönderilir. E-posta adresinizin güncel olduğundan emin olmak için Profil ve Ayarlar sayfasını kontrol edin.');

      obj[key] = text;
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      translateObj(obj[key]);
    }
  }
}

translateObj(trData.help.docs);

fs.writeFileSync(trJsonPath, JSON.stringify(trData, null, 2) + '\n');
console.log('Translated tr.json successfully.');
