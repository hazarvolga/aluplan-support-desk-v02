const fs = require('fs');
const path = require('path');

const locales = ['en', 'tr', 'de'];
const messagesDir = path.join(__dirname, 'apps/frontend/messages');

const newKeys = {
  admin: {
    system_settings: {
      title: {
        en: "General Settings",
        tr: "Genel Ayarlar",
        de: "Allgemeine Einstellungen"
      },
      desc: {
        en: "Manage platform-wide configuration settings. Configure CRM integration, email notifications, and system parameters here.",
        tr: "Platform genelindeki yapılandırma ayarlarını bu sayfadan yönetin. CRM entegrasyonu, e-posta bildirimleri ve sistem parametrelerini buradan ayarlayın.",
        de: "Verwalten Sie hier die plattformweiten Konfigurationseinstellungen. Konfigurieren Sie CRM-Integration, E-Mail-Benachrichtigungen und Systemparameter."
      },
      crm_title: {
        en: "CRM Integration",
        tr: "CRM Entegrasyonu",
        de: "CRM-Integration"
      },
      crm_desc: {
        en: "Configure Dynamics 365 integration to automatically synchronize customer and company data.",
        tr: "Dynamics 365 entegrasyonunu yapılandırarak müşteri ve şirket verilerini otomatik olarak senkronize edin.",
        de: "Konfigurieren Sie die Dynamics 365-Integration, um Kunden- und Unternehmensdaten automatisch zu synchronisieren."
      },
      crm_step1_title: {
        en: "1. Go to Settings",
        tr: "1. Ayarlar sayfasına gidin",
        de: "1. Gehen Sie zu Einstellungen"
      },
      crm_step1_desc: {
        en: "Click on the <strong>Settings</strong> link in the left menu.",
        tr: "Sol menüden <strong>Ayarlar</strong> bağlantısına tıklayın.",
        de: "Klicken Sie auf den Link <strong>Einstellungen</strong> im linken Menü."
      },
      crm_step2_title: {
        en: "2. Find CRM Integration section",
        tr: "2. CRM Entegrasyonu bölümünü bulun",
        de: "2. Suchen Sie den Bereich CRM-Integration"
      },
      crm_step2_desc: {
        en: "Enter Dynamics 365 connection details.",
        tr: "Dynamics 365 bağlantı bilgilerini girin.",
        de: "Geben Sie die Verbindungsdetails für Dynamics 365 ein."
      },
      crm_step3_title: {
        en: "3. Configure field mapping",
        tr: "3. Alan eşleştirmesini yapılandırın",
        de: "3. Feldzuordnung konfigurieren"
      },
      crm_step3_desc: {
        en: "Map CRM fields to system fields. Incorrect mapping can lead to data inconsistencies.",
        tr: "CRM alanlarını sistem alanlarıyla eşleştirin. Yanlış eşleştirme veri tutarsızlıklarına yol açabilir.",
        de: "Ordnen Sie CRM-Felder Systemfeldern zu. Eine falsche Zuordnung kann zu Dateninkonsistenzen führen."
      },
      crm_step4_title: {
        en: "4. Test synchronization",
        tr: "4. Senkronizasyonu test edin",
        de: "4. Synchronisation testen"
      },
      crm_step4_desc: {
        en: "Start a manual synchronization using the \"Trigger Sync\" button and check the results.",
        tr: "\"Senkronizasyonu Tetikle\" butonuyla manuel senkronizasyon başlatın ve sonuçları kontrol edin.",
        de: "Starten Sie eine manuelle Synchronisation über die Schaltfläche \"Synchronisation auslösen\" und überprüfen Sie die Ergebnisse."
      },
      other_title: {
        en: "Other Settings",
        tr: "Diğer Ayarlar",
        de: "Weitere Einstellungen"
      },
      other_item1: {
        en: "<strong>Email Notifications:</strong> Configure email templates for ticket updates.",
        tr: "<strong>E-posta Bildirimleri:</strong> Bilet güncellemeleri için e-posta şablonlarını yapılandırın.",
        de: "<strong>E-Mail-Benachrichtigungen:</strong> Konfigurieren Sie E-Mail-Vorlagen für Ticket-Updates."
      },
      other_item2: {
        en: "<strong>Language Settings:</strong> Set the platform default language.",
        tr: "<strong>Dil Ayarları:</strong> Platform varsayılan dilini belirleyin.",
        de: "<strong>Spracheinstellungen:</strong> Legen Sie die Standardsprache der Plattform fest."
      },
      other_item3: {
        en: "<strong>Security:</strong> Set session duration and password policies.",
        tr: "<strong>Güvenlik:</strong> Oturum süresi ve şifre politikalarını ayarlayın.",
        de: "<strong>Sicherheit:</strong> Legen Sie Sitzungsdauer und Kennwortrichtlinien fest."
      },
      tip_warning_title: {
        en: "Be Careful",
        tr: "Dikkatli Olun",
        de: "Seien Sie vorsichtig"
      },
      tip_warning_desc: {
        en: "Changes on the settings page affect the entire system. Always take a backup before changing CRM field mappings.",
        tr: "Ayarlar sayfasındaki değişiklikler tüm sistemi etkiler. Özellikle CRM alan eşleştirmelerini değiştirmeden önce yedek alın.",
        de: "Änderungen auf der Einstellungsseite wirken sich auf das gesamte System aus. Erstellen Sie immer ein Backup, bevor Sie CRM-Feldzuordnungen ändern."
      }
    },
    system_topology: {
      title: {
        en: "System Topology",
        tr: "Sistem Topolojisi",
        de: "Systemtopologie"
      },
      desc: {
        en: "The System Topology page displays the infrastructure components of the platform and the status of AI nodes in real-time.",
        tr: "Sistem Topolojisi sayfası, platformun altyapı bileşenlerini ve AI node'larının durumunu gerçek zamanlı olarak görüntüler.",
        de: "Die Systemtopologie-Seite zeigt die Infrastrukturkomponenten der Plattform und den Status der KI-Knoten in Echtzeit an."
      },
      view_title: {
        en: "Topology View",
        tr: "Topoloji Görünümü",
        de: "Topologie-Ansicht"
      },
      view_desc: {
        en: "This page shows system administrators the overall health status of the infrastructure. The following components are monitored:",
        tr: "Bu sayfa, sistem yöneticilerine altyapının genel sağlık durumunu gösterir. Aşağıdaki bileşenler izlenir:",
        de: "Diese Seite zeigt Systemadministratoren den allgemeinen Gesundheitszustand der Infrastruktur an. Folgende Komponenten werden überwacht:"
      },
      view_ai_name: {
        en: "AI Nodes",
        tr: "AI Node'ları",
        de: "KI-Knoten"
      },
      view_ai_desc: {
        en: "Status of Ollama and vector computation nodes",
        tr: "Ollama ve vektör hesaplama node'larının durumu",
        de: "Status von Ollama und Vektorberechnungsknoten"
      },
      view_db_name: {
        en: "Database",
        tr: "Veritabanı",
        de: "Datenbank"
      },
      view_db_desc: {
        en: "Number of active DB nodes and connection status",
        tr: "Aktif DB node sayısı ve bağlantı durumu",
        de: "Anzahl aktiver DB-Knoten und Verbindungsstatus"
      },
      view_api_name: {
        en: "API Services",
        tr: "API Servisleri",
        de: "API-Dienste"
      },
      view_api_desc: {
        en: "Response times of backend services",
        tr: "Backend servislerinin yanıt süreleri",
        de: "Antwortzeiten von Backend-Diensten"
      },
      view_uptime_name: {
        en: "Uptime",
        tr: "Uptime",
        de: "Uptime"
      },
      view_uptime_desc: {
        en: "SLA compliant uptime percentage",
        tr: "SLA uyumlu çalışma süresi yüzdesi",
        de: "SLA-konformer Verfügbarkeitsprozentsatz"
      },
      status_title: {
        en: "Status Indicators",
        tr: "Durum Göstergeleri",
        de: "Statusanzeigen"
      },
      status_online: {
        en: "<strong>Active / Online:</strong> Component is working normally.",
        tr: "<strong>Aktif / Online:</strong> Bileşen normal çalışıyor.",
        de: "<strong>Aktiv / Online:</strong> Komponente funktioniert normal."
      },
      status_warning: {
        en: "<strong>Warning:</strong> There is a performance drop or delay.",
        tr: "<strong>Uyarı:</strong> Performans düşüklüğü veya gecikme var.",
        de: "<strong>Warnung:</strong> Es liegt ein Leistungsabfall oder eine Verzögerung vor."
      },
      status_offline: {
        en: "<strong>Offline / Error:</strong> Component is unreachable.",
        tr: "<strong>Offline / Hata:</strong> Bileşen erişilemiyor.",
        de: "<strong>Offline / Fehler:</strong> Komponente ist nicht erreichbar."
      },
      telemetry_title: {
        en: "AI Health Telemetry",
        tr: "AI Sağlık Telemetrisi",
        de: "KI-Gesundheitstelemetrie"
      },
      telemetry_desc: {
        en: "Visit the <strong>AI Health & Telemetry</strong> page for more detailed AI performance metrics.",
        tr: "Daha detaylı AI performans metrikleri için <strong>AI Sağlık & Telemetri</strong> sayfasını ziyaret edin.",
        de: "Besuchen Sie die Seite <strong>KI-Gesundheit & Telemetrie</strong> für detailliertere KI-Leistungsmetriken."
      },
      telemetry_item1: {
        en: "Token usage and cost tracking",
        tr: "Token kullanımı ve maliyet takibi",
        de: "Token-Nutzung und Kostenverfolgung"
      },
      telemetry_item2: {
        en: "RAG accuracy rates and confidence distribution",
        tr: "RAG doğruluk oranları ve güven dağılımı",
        de: "RAG-Genauigkeitsraten und Vertrauensverteilung"
      },
      telemetry_item3: {
        en: "Unanswered questions (knowledge base gaps)",
        tr: "Yanıtsız kalan sorular (bilgi bankası boşlukları)",
        de: "Unbeantwortete Fragen (Lücken in der Wissensdatenbank)"
      },
      tip_readonly_title: {
        en: "Read-Only Access",
        tr: "Sadece Okuma Yetkisi",
        de: "Nur-Lese-Zugriff"
      },
      tip_readonly_desc: {
        en: "The System Topology page is for monitoring purposes only. Contact your system administrator for infrastructure configuration.",
        tr: "Sistem Topolojisi sayfası yalnızca izleme amaçlıdır. Altyapı yapılandırması için sistem yöneticinizle iletişime geçin.",
        de: "Die Systemtopologie-Seite dient nur zu Überwachungszwecken. Wenden Sie sich für die Infrastrukturkonfiguration an Ihren Systemadministrator."
      }
    }
  }
};

locales.forEach(locale => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(fileContent);

  if (!json.help.docs.admin) {
    json.help.docs.admin = {};
  }

  // Inject the keys for each component
  for (const component in newKeys.admin) {
    if (!json.help.docs.admin[component]) {
      json.help.docs.admin[component] = {};
    }
    
    for (const key in newKeys.admin[component]) {
      json.help.docs.admin[component][key] = newKeys.admin[component][key][locale];
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
  console.log(`Updated ${locale}.json`);
});
