const fs = require('fs');
const path = require('path');

const locales = ['en', 'tr', 'de'];
const basePath = path.join(__dirname, 'apps/frontend/messages');

const translations = {
  en: {
    "help.docs.admin.announcements_overview": {
      "title": "Creating & Publishing Announcements",
      "desc": "Follow the 4-step process to send bulk or targeted announcements (campaigns, maintenance notifications, etc.) to your customers.",
      "process_title": "4-Step Announcement Process",
      "step1_title": "Template Preparation",
      "step1_desc": "Design and save reusable email content in the Templates tab.",
      "step2_title": "Announcement Creation and Template Selection",
      "step2_desc": "Write new content in the Create Announcement tab or apply a template from the top menu.",
      "step3_title": "Target Audience Selection",
      "step3_desc": "Determine which sector or company the announcement will be sent to using the filters on the right. The system instantly shows the number of people to be reached.",
      "step4_title": "Save Draft and Publish",
      "step4_desc": "When the \"Protocol Draft\" button is pressed, your announcement is saved as a Draft. No emails are sent yet. Find the relevant announcement from the History tab and send the real emails by clicking the \"Publish\" icon.",
      "filter_title": "Target Audience Filters",
      "filter_sector": "<strong>Sector:</strong> All customers in a specific sector",
      "filter_company": "<strong>Company:</strong> All users in a specific company",
      "filter_all": "<strong>All Customers:</strong> All active users in the system",
      "tip_test_title": "Test Before Sending",
      "tip_test_desc": "Test your draft announcements in preview mode. Real emails are only sent when the \"Publish\" icon is clicked."
    },
    "help.docs.admin.announcements_templates": {
      "title": "Template Library",
      "desc": "Create reusable email templates. Templates speed up the announcement creation process and ensure consistent communication.",
      "create_title": "Creating a Template",
      "step1_title": "1. Go to Announcement Management page",
      "step1_desc": "Click the <strong>Announcements</strong> link from the left menu.",
      "step2_title": "2. Open the Templates tab",
      "step2_desc": "Switch to the <strong>Templates</strong> tab at the top of the page.",
      "step3_title": "3. Create a new template",
      "step3_desc": "Enter template name, subject line, and email content. HTML format is supported.",
      "step4_title": "4. Save",
      "step4_desc": "It is added to your template library and can be used when creating an announcement.",
      "use_title": "Using a Template",
      "use_item1": "When creating an announcement, use the <strong>Apply Template</strong> option from the top menu.",
      "use_item2": "Template content is automatically filled into the form.",
      "use_item3": "You can customize the content after applying the template.",
      "types_title": "Recommended Template Types",
      "type_maintenance": "Maintenance Notification",
      "type_maintenance_desc": "Planned system maintenance announcement",
      "type_feature": "New Feature",
      "type_feature_desc": "Platform updates and new features",
      "type_urgent": "Urgent Notification",
      "type_urgent_desc": "For critical system situations",
      "type_general": "General Announcement",
      "type_general_desc": "For routine information",
      "tip_update_title": "Keep Templates Updated",
      "tip_update_desc": "Remember to update all templates when company information or contact details change."
    },
    "help.docs.admin.crm_products": {
      "title": "Products & Modules",
      "desc": "Manage the product cards that customers see when opening a ticket from here. Properly configured products allow AI to direct tickets to the correct team.",
      "add_title": "Adding a Product",
      "step1_title": "1. Go to the Products & Modules page",
      "step1_desc": "Click the <strong>Products</strong> link from the left menu.",
      "step2_title": "2. Click the \"Add New Product\" button",
      "step2_desc": "Enter the product name and a short description.",
      "step3_title": "3. Add subcategories",
      "step3_desc": "Create subcategories (modules) for each product. These categories are used in AI ticket classification.",
      "category_title": "Category Structure",
      "category_desc": "You can define multiple categories (modules) under each product. Categories are used by AI to automatically tag tickets.",
      "example_title": "Example Structure:",
      "tip_keywords_title": "Keywords are Critical",
      "tip_keywords_desc": "Add not only feature names to categories but also customer symptoms (e.g. \"slowdown\", \"black screen\", \"crashing\"). AI reads these keywords and directs the ticket to the right team (Triage)."
    },
    "help.docs.admin.crm_taxonomy": {
      "title": "Taxonomy & Keywords",
      "desc": "Taxonomy rules allow AI to automatically assign incoming tickets to the correct product category.",
      "what_title": "What is a Taxonomy Rule?",
      "what_desc": "The keywords you define for each category are the tagging rules AI uses when analyzing ticket content.",
      "example_title": "Example Rule:",
      "example_category": "<strong>Category:</strong> Model Crash",
      "example_keywords": "<strong>Keywords:</strong>",
      "example_desc": "Tickets containing any of these keywords are automatically assigned to the \"Model Crash\" category.",
      "strategy_title": "Keyword Strategy",
      "strategy_item1": "<strong>Feature names:</strong> Wall, Slab, Roof, Render",
      "strategy_item2": "<strong>Customer symptoms:</strong> slow, freezing, won't open, error",
      "strategy_item3": "<strong>Error codes:</strong> 0x80070005, Error 1001",
      "strategy_item4": "<strong>Turkish and English:</strong> Add keywords in both languages",
      "tip_conflict_title": "Conflicting Keywords",
      "tip_conflict_desc": "Avoid using the same keyword in multiple categories. Conflicts may cause AI to misclassify."
    },
    "help.docs.admin.system_profile": {
      "title": "Profile Management",
      "desc": "Update your personal information, change your password, and manage your account preferences.",
      "update_title": "Updating Profile Information",
      "step1_title": "1. Go to the profile page",
      "step1_desc": "Click the <strong>My Profile</strong> link at the bottom of the left menu.",
      "step2_title": "2. Edit information",
      "step2_desc": "Update information such as name, surname, phone number, and job title.",
      "step3_title": "3. Save",
      "step3_desc": "Apply your changes by clicking the <strong>Save</strong> button.",
      "password_title": "Changing Password",
      "password_item1": "Go to the <strong>Change Password</strong> section on the profile page.",
      "password_item2": "Enter your current password and your new password.",
      "password_item3": "Your new password must be at least 8 characters long.",
      "lang_title": "Language Preference",
      "lang_desc": "You can change the platform interface language from your profile page. Turkish and English are supported.",
      "tip_secure_title": "Use a Secure Password",
      "tip_secure_desc": "For your account's security, use a strong password containing uppercase/lowercase letters, numbers, and special characters. Change your password regularly."
    }
  },
  tr: {
    "help.docs.admin.announcements_overview": {
      "title": "Duyuru Oluşturma & Yayınlama",
      "desc": "Müşterilerinize toplu veya hedefli duyurular (kampanyalar, bakım bildirimleri vb.) göndermek için 4 adımlı süreci takip edin.",
      "process_title": "4 Adımlı Duyuru Süreci",
      "step1_title": "Şablon Hazırlama",
      "step1_desc": "Şablonlar sekmesinde yeniden kullanabileceğiniz e-posta içerikleri tasarlayın ve kaydedin.",
      "step2_title": "Duyuru Oluşturma ve Şablon Seçimi",
      "step2_desc": "Duyuru Oluştur sekmesinde yeni içerik yazın veya üst menüden bir şablon uygulayın.",
      "step3_title": "Hedef Kitle Seçimi",
      "step3_desc": "Sağdaki filtrelerle duyurunun hangi sektör veya şirkete gönderileceğini belirleyin. Sistem ulaşılacak kişi sayısını anlık gösterir.",
      "step4_title": "Taslak Kaydet ve Yayınla",
      "step4_desc": "\"Protokol Taslağı\" butonuna basıldığında duyurunuz Taslak olarak kaydedilir. Henüz e-posta gönderilmez. Geçmiş sekmesinden ilgili duyuruyu bulun ve \"Yayınla\" ikonuna tıklayarak gerçek e-postaları gönderin.",
      "filter_title": "Hedef Kitle Filtreleri",
      "filter_sector": "<strong>Sektör:</strong> Belirli bir sektördeki tüm müşteriler",
      "filter_company": "<strong>Şirket:</strong> Belirli bir şirketteki tüm kullanıcılar",
      "filter_all": "<strong>Tüm Müşteriler:</strong> Sistemdeki tüm aktif kullanıcılar",
      "tip_test_title": "Göndermeden Önce Test Edin",
      "tip_test_desc": "Taslak duyurularınızı önizleme modunda test edin. Gerçek e-postalar yalnızca \"Yayınla\" ikonuna tıklandığında gönderilir."
    },
    "help.docs.admin.announcements_templates": {
      "title": "Şablon Kütüphanesi",
      "desc": "Tekrar kullanabileceğiniz e-posta şablonları oluşturun. Şablonlar, duyuru oluşturma sürecini hızlandırır ve tutarlı iletişim sağlar.",
      "create_title": "Şablon Oluşturma",
      "step1_title": "1. Duyuru Yönetimi sayfasına gidin",
      "step1_desc": "Sol menüden <strong>Duyurular</strong> bağlantısına tıklayın.",
      "step2_title": "2. Şablonlar sekmesini açın",
      "step2_desc": "Sayfanın üst kısmındaki <strong>Şablonlar</strong> sekmesine geçin.",
      "step3_title": "3. Yeni şablon oluşturun",
      "step3_desc": "Şablon adı, konu satırı ve e-posta içeriğini girin. HTML formatı desteklenmektedir.",
      "step4_title": "4. Kaydedin",
      "step4_desc": "Şablon kütüphanenize eklenir ve duyuru oluştururken kullanılabilir.",
      "use_title": "Şablon Kullanımı",
      "use_item1": "Duyuru oluştururken üst menüden <strong>Şablon Uygula</strong> seçeneğini kullanın.",
      "use_item2": "Şablon içeriği forma otomatik olarak doldurulur.",
      "use_item3": "Şablonu uyguladıktan sonra içeriği özelleştirebilirsiniz.",
      "types_title": "Önerilen Şablon Türleri",
      "type_maintenance": "Bakım Bildirimi",
      "type_maintenance_desc": "Planlı sistem bakımı duyurusu",
      "type_feature": "Yeni Özellik",
      "type_feature_desc": "Platform güncellemeleri ve yeni özellikler",
      "type_urgent": "Acil Bildirim",
      "type_urgent_desc": "Kritik sistem durumları için",
      "type_general": "Genel Duyuru",
      "type_general_desc": "Rutin bilgilendirmeler için",
      "tip_update_title": "Şablonları Güncel Tutun",
      "tip_update_desc": "Şirket bilgileri veya iletişim detayları değiştiğinde tüm şablonları güncellemeyi unutmayın."
    },
    "help.docs.admin.crm_products": {
      "title": "Ürünler & Modüller",
      "desc": "Müşterilerin bilet açarken gördüğü ürün kartlarını buradan yönetin. Doğru yapılandırılmış ürünler, AI'ın biletleri doğru ekibe yönlendirmesini sağlar.",
      "add_title": "Ürün Ekleme",
      "step1_title": "1. Ürünler & Modüller sayfasına gidin",
      "step1_desc": "Sol menüden <strong>Ürünler</strong> bağlantısına tıklayın.",
      "step2_title": "2. \"Yeni Ürün Ekle\" butonuna tıklayın",
      "step2_desc": "Ürün adı ve kısa açıklama girin.",
      "step3_title": "3. Alt kategoriler ekleyin",
      "step3_desc": "Her ürün için alt kategoriler (modüller) oluşturun. Bu kategoriler AI'ın bilet sınıflandırmasında kullanılır.",
      "category_title": "Kategori Yapısı",
      "category_desc": "Her ürün altında birden fazla kategori (modül) tanımlayabilirsiniz. Kategoriler, AI'ın biletleri otomatik etiketlemesinde kullanılır.",
      "example_title": "Örnek Yapı:",
      "tip_keywords_title": "Anahtar Kelimeler Kritik",
      "tip_keywords_desc": "Kategorilere yalnızca özellik adları değil, müşteri semptomlarını da ekleyin (örn. \"yavaşlama\", \"siyah ekran\", \"kapanıyor\"). AI bu anahtar kelimeleri okuyarak bileti doğru ekibe yönlendirir (Triage)."
    },
    "help.docs.admin.crm_taxonomy": {
      "title": "Taksonomi & Anahtar Kelimeler",
      "desc": "Taksonomi kuralları, AI'ın gelen biletleri doğru ürün kategorisine otomatik olarak atamasını sağlar.",
      "what_title": "Taksonomi Kuralı Nedir?",
      "what_desc": "Her kategori için tanımladığınız anahtar kelimeler, AI'ın bilet içeriğini analiz ederken kullandığı etiketleme kurallarıdır.",
      "example_title": "Örnek Kural:",
      "example_category": "<strong>Kategori:</strong> Model Çökmesi",
      "example_keywords": "<strong>Anahtar Kelimeler:</strong>",
      "example_desc": "Bu anahtar kelimelerden herhangi birini içeren biletler otomatik olarak \"Model Çökmesi\" kategorisine atanır.",
      "strategy_title": "Anahtar Kelime Stratejisi",
      "strategy_item1": "<strong>Özellik adları:</strong> Duvar, Döşeme, Çatı, Render",
      "strategy_item2": "<strong>Müşteri semptomları:</strong> yavaş, donuyor, açılmıyor, hata",
      "strategy_item3": "<strong>Hata kodları:</strong> 0x80070005, Error 1001",
      "strategy_item4": "<strong>Türkçe ve İngilizce:</strong> Her iki dilde de anahtar kelime ekleyin",
      "tip_conflict_title": "Çakışan Anahtar Kelimeler",
      "tip_conflict_desc": "Aynı anahtar kelimeyi birden fazla kategoride kullanmaktan kaçının. Çakışmalar AI'ın yanlış sınıflandırma yapmasına neden olabilir."
    },
    "help.docs.admin.system_profile": {
      "title": "Profil Yönetimi",
      "desc": "Kişisel bilgilerinizi güncelleyin, şifrenizi değiştirin ve hesap tercihlerinizi yönetin.",
      "update_title": "Profil Bilgilerini Güncelleme",
      "step1_title": "1. Profil sayfasına gidin",
      "step1_desc": "Sol menünün alt kısmındaki <strong>Profilim</strong> bağlantısına tıklayın.",
      "step2_title": "2. Bilgileri düzenleyin",
      "step2_desc": "Ad, soyad, telefon numarası ve iş unvanı gibi bilgileri güncelleyin.",
      "step3_title": "3. Kaydedin",
      "step3_desc": "<strong>Kaydet</strong> butonuna tıklayarak değişikliklerinizi uygulayın.",
      "password_title": "Şifre Değiştirme",
      "password_item1": "Profil sayfasındaki <strong>Şifre Değiştir</strong> bölümüne gidin.",
      "password_item2": "Mevcut şifrenizi ve yeni şifrenizi girin.",
      "password_item3": "Yeni şifreniz en az 8 karakter uzunluğunda olmalıdır.",
      "lang_title": "Dil Tercihi",
      "lang_desc": "Platform arayüz dilini profil sayfanızdan değiştirebilirsiniz. Türkçe ve İngilizce desteklenmektedir.",
      "tip_secure_title": "Güvenli Şifre Kullanın",
      "tip_secure_desc": "Hesabınızın güvenliği için büyük/küçük harf, rakam ve özel karakter içeren güçlü bir şifre kullanın. Şifrenizi düzenli olarak değiştirin."
    }
  },
  de: {
    "help.docs.admin.announcements_overview": {
      "title": "Ankündigungen erstellen & veröffentlichen",
      "desc": "Folgen Sie dem 4-stufigen Prozess, um Massen- oder gezielte Ankündigungen (Kampagnen, Wartungsbenachrichtigungen usw.) an Ihre Kunden zu senden.",
      "process_title": "4-stufiger Ankündigungsprozess",
      "step1_title": "Vorlagenvorbereitung",
      "step1_desc": "Entwerfen und speichern Sie wiederverwendbare E-Mail-Inhalte auf der Registerkarte Vorlagen.",
      "step2_title": "Ankündigungserstellung und Vorlagenauswahl",
      "step2_desc": "Schreiben Sie neue Inhalte auf der Registerkarte Ankündigung erstellen oder wenden Sie eine Vorlage aus dem oberen Menü an.",
      "step3_title": "Auswahl der Zielgruppe",
      "step3_desc": "Legen Sie mithilfe der Filter auf der rechten Seite fest, an welchen Sektor oder an welches Unternehmen die Ankündigung gesendet wird. Das System zeigt sofort die Anzahl der zu erreichenden Personen an.",
      "step4_title": "Entwurf speichern und veröffentlichen",
      "step4_desc": "Wenn die Schaltfläche \"Protokollentwurf\" gedrückt wird, wird Ihre Ankündigung als Entwurf gespeichert. Es werden noch keine E-Mails versendet. Suchen Sie die entsprechende Ankündigung auf der Registerkarte Verlauf und senden Sie die echten E-Mails, indem Sie auf das Symbol \"Veröffentlichen\" klicken.",
      "filter_title": "Zielgruppenfilter",
      "filter_sector": "<strong>Sektor:</strong> Alle Kunden in einem bestimmten Sektor",
      "filter_company": "<strong>Unternehmen:</strong> Alle Benutzer in einem bestimmten Unternehmen",
      "filter_all": "<strong>Alle Kunden:</strong> Alle aktiven Benutzer im System",
      "tip_test_title": "Vor dem Senden testen",
      "tip_test_desc": "Testen Sie Ihre Entwurfsankündigungen im Vorschau-Modus. Echte E-Mails werden erst gesendet, wenn auf das Symbol \"Veröffentlichen\" geklickt wird."
    },
    "help.docs.admin.announcements_templates": {
      "title": "Vorlagenbibliothek",
      "desc": "Erstellen Sie wiederverwendbare E-Mail-Vorlagen. Vorlagen beschleunigen den Erstellungsprozess von Ankündigungen und sorgen für eine konsistente Kommunikation.",
      "create_title": "Eine Vorlage erstellen",
      "step1_title": "1. Gehen Sie zur Seite Ankündigungsverwaltung",
      "step1_desc": "Klicken Sie im linken Menü auf den Link <strong>Ankündigungen</strong>.",
      "step2_title": "2. Öffnen Sie die Registerkarte Vorlagen",
      "step2_desc": "Wechseln Sie zur Registerkarte <strong>Vorlagen</strong> oben auf der Seite.",
      "step3_title": "3. Erstellen Sie eine neue Vorlage",
      "step3_desc": "Geben Sie den Vorlagennamen, die Betreffzeile und den E-Mail-Inhalt ein. Das HTML-Format wird unterstützt.",
      "step4_title": "4. Speichern",
      "step4_desc": "Sie wird Ihrer Vorlagenbibliothek hinzugefügt und kann bei der Erstellung einer Ankündigung verwendet werden.",
      "use_title": "Verwenden einer Vorlage",
      "use_item1": "Verwenden Sie beim Erstellen einer Ankündigung die Option <strong>Vorlage anwenden</strong> aus dem oberen Menü.",
      "use_item2": "Der Vorlageninhalt wird automatisch in das Formular eingefügt.",
      "use_item3": "Sie können den Inhalt anpassen, nachdem Sie die Vorlage angewendet haben.",
      "types_title": "Empfohlene Vorlagentypen",
      "type_maintenance": "Wartungsbenachrichtigung",
      "type_maintenance_desc": "Geplante Systemwartungsankündigung",
      "type_feature": "Neue Funktion",
      "type_feature_desc": "Plattform-Updates und neue Funktionen",
      "type_urgent": "Dringende Benachrichtigung",
      "type_urgent_desc": "Für kritische Systemsituationen",
      "type_general": "Allgemeine Ankündigung",
      "type_general_desc": "Für Routineinformationen",
      "tip_update_title": "Vorlagen aktuell halten",
      "tip_update_desc": "Denken Sie daran, alle Vorlagen zu aktualisieren, wenn sich Unternehmensinformationen oder Kontaktdaten ändern."
    },
    "help.docs.admin.crm_products": {
      "title": "Produkte & Module",
      "desc": "Verwalten Sie hier die Produktkarten, die Kunden beim Öffnen eines Tickets sehen. Richtig konfigurierte Produkte ermöglichen es der KI, Tickets an das richtige Team weiterzuleiten.",
      "add_title": "Ein Produkt hinzufügen",
      "step1_title": "1. Gehen Sie zur Seite Produkte & Module",
      "step1_desc": "Klicken Sie im linken Menü auf den Link <strong>Produkte</strong>.",
      "step2_title": "2. Klicken Sie auf die Schaltfläche \"Neues Produkt hinzufügen\"",
      "step2_desc": "Geben Sie den Produktnamen und eine kurze Beschreibung ein.",
      "step3_title": "3. Unterkategorien hinzufügen",
      "step3_desc": "Erstellen Sie Unterkategorien (Module) für jedes Produkt. Diese Kategorien werden bei der KI-Ticketklassifizierung verwendet.",
      "category_title": "Kategoriestruktur",
      "category_desc": "Sie können mehrere Kategorien (Module) unter jedem Produkt definieren. Kategorien werden von der KI verwendet, um Tickets automatisch zu markieren.",
      "example_title": "Beispielstruktur:",
      "tip_keywords_title": "Schlüsselwörter sind kritisch",
      "tip_keywords_desc": "Fügen Sie Kategorien nicht nur Funktionsnamen hinzu, sondern auch Kundensymptome (z. B. \"Verlangsamung\", \"schwarzer Bildschirm\", \"Absturz\"). Die KI liest diese Schlüsselwörter und leitet das Ticket an das richtige Team weiter (Triage)."
    },
    "help.docs.admin.crm_taxonomy": {
      "title": "Taxonomie & Schlüsselwörter",
      "desc": "Taxonomieregeln ermöglichen es der KI, eingehende Tickets automatisch der richtigen Produktkategorie zuzuordnen.",
      "what_title": "Was ist eine Taxonomieregel?",
      "what_desc": "Die Schlüsselwörter, die Sie für jede Kategorie definieren, sind die Tagging-Regeln, die KI bei der Analyse des Ticketinhalts verwendet.",
      "example_title": "Beispielregel:",
      "example_category": "<strong>Kategorie:</strong> Modellabsturz",
      "example_keywords": "<strong>Schlüsselwörter:</strong>",
      "example_desc": "Tickets, die eines dieser Schlüsselwörter enthalten, werden automatisch der Kategorie \"Modellabsturz\" zugeordnet.",
      "strategy_title": "Schlüsselwortstrategie",
      "strategy_item1": "<strong>Funktionsnamen:</strong> Wand, Decke, Dach, Render",
      "strategy_item2": "<strong>Kundensymptome:</strong> langsam, einfrieren, öffnet sich nicht, Fehler",
      "strategy_item3": "<strong>Fehlercodes:</strong> 0x80070005, Fehler 1001",
      "strategy_item4": "<strong>Türkisch und Englisch:</strong> Fügen Sie Schlüsselwörter in beiden Sprachen hinzu",
      "tip_conflict_title": "Kollidierende Schlüsselwörter",
      "tip_conflict_desc": "Vermeiden Sie es, dasselbe Schlüsselwort in mehreren Kategorien zu verwenden. Konflikte können dazu führen, dass die KI falsch klassifiziert."
    },
    "help.docs.admin.system_profile": {
      "title": "Profilverwaltung",
      "desc": "Aktualisieren Sie Ihre persönlichen Daten, ändern Sie Ihr Passwort und verwalten Sie Ihre Kontoeinstellungen.",
      "update_title": "Profilinformationen aktualisieren",
      "step1_title": "1. Gehen Sie zur Profilseite",
      "step1_desc": "Klicken Sie unten im linken Menü auf den Link <strong>Mein Profil</strong>.",
      "step2_title": "2. Informationen bearbeiten",
      "step2_desc": "Aktualisieren Sie Informationen wie Vorname, Nachname, Telefonnummer und Berufsbezeichnung.",
      "step3_title": "3. Speichern",
      "step3_desc": "Übernehmen Sie Ihre Änderungen, indem Sie auf die Schaltfläche <strong>Speichern</strong> klicken.",
      "password_title": "Passwort ändern",
      "password_item1": "Gehen Sie zum Bereich <strong>Passwort ändern</strong> auf der Profilseite.",
      "password_item2": "Geben Sie Ihr aktuelles Passwort und Ihr neues Passwort ein.",
      "password_item3": "Ihr neues Passwort muss mindestens 8 Zeichen lang sein.",
      "lang_title": "Sprachpräferenz",
      "lang_desc": "Sie können die Sprache der Plattformoberfläche auf Ihrer Profilseite ändern. Türkisch und Englisch werden unterstützt.",
      "tip_secure_title": "Verwenden Sie ein sicheres Passwort",
      "tip_secure_desc": "Verwenden Sie für die Sicherheit Ihres Kontos ein sicheres Passwort, das Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen enthält. Ändern Sie Ihr Passwort regelmäßig."
    }
  }
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

function unflatten(data) {
  const result = {};
  for (const key in data) {
    const keys = key.split('.');
    keys.reduce((acc, currentKey, index) => {
      if (index === keys.length - 1) {
        acc[currentKey] = data[key];
      } else {
        acc[currentKey] = acc[currentKey] || {};
      }
      return acc[currentKey];
    }, result);
  }
  return result;
}

for (const locale of locales) {
  const filePath = path.join(basePath, `${locale}.json`);
  const currentContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const newTranslations = unflatten(translations[locale]);
  
  const updatedContent = deepMerge(currentContent, newTranslations);
  fs.writeFileSync(filePath, JSON.stringify(updatedContent, null, 2));
  console.log(`Updated ${locale}.json`);
}
