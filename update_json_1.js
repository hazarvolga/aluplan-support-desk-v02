const fs = require('fs');
const path = require('path');

const locales = ['en', 'tr', 'de'];
const basePath = path.join(__dirname, 'apps/frontend/messages');

const translations = {
  en: {
    "help.docs.customer.getting_started_announcements": {
      "title": "Announcements Board",
      "desc": "Track maintenance notifications, new features, and important updates via the <strong>Announcements</strong> board.",
      "read_announcements_title": "Reading Announcements",
      "read_announcements_desc": "Announcements are listed from newest to oldest.",
      "read_item1": "Click the Bell icon in the left menu to view announcements.",
      "read_item2": "Unread announcements are marked with a notification dot.",
      "read_item3": "Click on an announcement to read its full details.",
      "types_title": "Announcement Types",
      "types_desc": "Announcements are categorized by their content.",
      "type1": "<strong>System Maintenance:</strong> Planned downtime or performance updates.",
      "type2": "<strong>New Features:</strong> Announcements about newly added modules.",
      "type3": "<strong>General:</strong> Company news or campaign information.",
      "tip_title": "Email Notifications",
      "tip_desc": "Critical system maintenance announcements are also sent to your registered email address."
    },
    "help.docs.customer.ai_assistant_overview": {
      "title": "AI Assistant",
      "desc": "The AI Assistant scans Aluplan's entire knowledge base within seconds to find solutions to your problems, preventing time lost waiting for support tickets.",
      "usage_title": "How to Use?",
      "usage_step1_title": "1. Go to the AI Assistant page",
      "usage_step1_desc": "Click the <strong>AI Assistant</strong> link in the left menu.",
      "usage_step2_title": "2. Type your question",
      "usage_step2_desc": "Type the error you received or the topic you want to learn in the message box.",
      "usage_step3_title": "3. Review the answer",
      "usage_step3_desc": "AI directly provides solution steps by scanning the knowledge base. If no solution is found, it suggests creating a support ticket.",
      "rag_title": "What is the RAG Mechanism?",
      "rag_desc": "The AI Assistant uses <strong>RAG (Retrieval-Augmented Generation)</strong> technology. This means the assistant scans the company's Knowledge Pool before generating an answer.",
      "rag_item1": "Your query is matched with relevant documents via vector search.",
      "rag_item2": "A contextual answer is generated from the matched documents.",
      "rag_item3": "Source documents are listed below the answer.",
      "tip_rag_title": "For Better Results",
      "tip_rag_desc": "Specify the software module name in your questions (e.g. <code>AX3000</code>). This ensures the AI finds more accurate results.",
      "no_answer_title": "What if no answer is found?",
      "no_answer_desc": "If the AI Assistant cannot find a suitable answer to your question, it automatically suggests <strong>creating a support ticket</strong>.",
      "tip_no_answer_title": "Info",
      "tip_no_answer_desc": "By clicking the 'No, Create Ticket' button, you can open a support ticket form pre-filled with the context the AI understood."
    },
    "help.docs.customer.ai_assistant_tips": {
      "title": "Tips for Effective Questions",
      "desc": "Learn how to formulate your questions to get the best results from the AI Assistant.",
      "do_title": "Do ✅",
      "do_item1_title": "Specify the module name",
      "do_item1_desc": "Write which Allplan module you are experiencing issues with.",
      "do_item2_title": "Copy the error message",
      "do_item2_desc": "Paste the exact error message you see on the screen.",
      "do_item3_title": "Describe the steps",
      "do_item3_desc": "State during which operation the error occurred.",
      "dont_title": "Don't ❌",
      "dont_item1_title": "Don't ask very general questions",
      "dont_item1_desc": "Which program? How is it not working?",
      "dont_item2_title": "Don't ask multiple topics in one question",
      "dont_item2_desc": "",
      "tip_pro_title": "Pro Tip",
      "tip_pro_desc": "Asking your question in English may allow the AI to access a broader knowledge base. However, Turkish and German questions are also fully supported."
    }
  },
  tr: {
    "help.docs.customer.getting_started_announcements": {
      "title": "Duyurular Panosu",
      "desc": "Bakım bildirimleri, yeni özellikler ve önemli güncellemeleri <strong>Duyurular</strong> panosu üzerinden takip edebilirsiniz.",
      "read_announcements_title": "Duyuruları Okuma",
      "read_announcements_desc": "Duyurular en yeniden en eskiye doğru sıralanır.",
      "read_item1": "Sol menüdeki Zil ikonuna tıklayarak duyuruları görüntüleyin.",
      "read_item2": "Okunmamış duyurular bildirim noktası ile belirtilir.",
      "read_item3": "Bir duyuruya tıklayarak tüm detaylarını okuyabilirsiniz.",
      "types_title": "Duyuru Türleri",
      "types_desc": "Duyurular içeriklerine göre kategorize edilir.",
      "type1": "<strong>Sistem Bakımı:</strong> Planlı kesinti veya performans güncellemeleri.",
      "type2": "<strong>Yeni Özellik:</strong> Sisteme yeni eklenen modüllerin duyurusu.",
      "type3": "<strong>Genel:</strong> Şirket haberleri veya kampanya bilgilendirmeleri.",
      "tip_title": "E-posta Bildirimleri",
      "tip_desc": "Kritik sistem bakımı duyuruları, sisteme kayıtlı e-posta adresinize de gönderilir."
    },
    "help.docs.customer.ai_assistant_overview": {
      "title": "AI Asistanı",
      "desc": "AI Asistanı, destek talebi bekleyerek zaman kaybetmenizi önlemek için saniyeler içinde tüm Aluplan bilgi bankasını tarayarak sorunlarınıza çözüm bulur.",
      "usage_title": "Nasıl Kullanılır?",
      "usage_step1_title": "1. AI Asistanı sayfasına gidin",
      "usage_step1_desc": "Sol menüden <strong>AI Asistanı</strong> bağlantısına tıklayın.",
      "usage_step2_title": "2. Sorunuzu yazın",
      "usage_step2_desc": "Mesaj kutusuna aldığınız hatayı veya öğrenmek istediğiniz konuyu yazın.",
      "usage_step3_title": "3. Yanıtı inceleyin",
      "usage_step3_desc": "AI, bilgi bankasını tarayarak çözüm adımlarını doğrudan sunar. Çözüm bulunamazsa destek talebi oluşturmanızı önerir.",
      "rag_title": "RAG Mekanizması Nedir?",
      "rag_desc": "AI Asistanı, <strong>RAG (Retrieval-Augmented Generation)</strong> teknolojisini kullanır. Bu, asistanın yanıt üretmeden önce şirketin bilgi havuzunu (Knowledge Pool) taraması anlamına gelir.",
      "rag_item1": "Sorgunuz vektör aramasıyla ilgili belgelerle eşleştirilir.",
      "rag_item2": "Eşleşen belgelerden bağlamsal bir yanıt oluşturulur.",
      "rag_item3": "Yanıtın altında kaynak belgeler listelenir.",
      "tip_rag_title": "Daha İyi Sonuçlar İçin",
      "tip_rag_desc": "Sorularınızda yazılım modülünün adını belirtin (örn. <code>AX3000</code>). Bu, AI'ın daha doğru sonuçlar bulmasını sağlar.",
      "no_answer_title": "Yanıt Bulunamazsa Ne Olur?",
      "no_answer_desc": "AI Asistanı sorunuza uygun bir yanıt bulamazsa, otomatik olarak <strong>destek talebi oluşturmanızı</strong> önerir.",
      "tip_no_answer_title": "Bilgi",
      "tip_no_answer_desc": "\"Hayır, Talep Oluştur\" butonuna tıklayarak AI'ın anladığı bağlamla önceden doldurulmuş bir destek talebi formu açabilirsiniz."
    },
    "help.docs.customer.ai_assistant_tips": {
      "title": "Etkili Soru Sorma İpuçları",
      "desc": "AI Asistanından en iyi sonuçları almak için sorularınızı nasıl formüle etmeniz gerektiğini öğrenin.",
      "do_title": "Yapın ✅",
      "do_item1_title": "Modül adını belirtin",
      "do_item1_desc": "Hangi Allplan modülünde sorun yaşadığınızı yazın.",
      "do_item2_title": "Hata mesajını kopyalayın",
      "do_item2_desc": "Ekranda gördüğünüz hata mesajını olduğu gibi yapıştırın.",
      "do_item3_title": "Adımları açıklayın",
      "do_item3_desc": "Hatanın hangi işlem sırasında oluştuğunu belirtin.",
      "dont_title": "Yapmayın ❌",
      "dont_item1_title": "Çok genel sorular sormayın",
      "dont_item1_desc": "Hangi program? Nasıl çalışmıyor?",
      "dont_item2_title": "Birden fazla konuyu tek soruda sormayın",
      "dont_item2_desc": "",
      "tip_pro_title": "Pro İpucu",
      "tip_pro_desc": "Sorunuzu İngilizce sormak, AI'ın daha geniş bir bilgi tabanına erişmesini sağlayabilir. Ancak Türkçe sorular da tam olarak desteklenmektedir."
    }
  },
  de: {
    "help.docs.customer.getting_started_announcements": {
      "title": "Ankündigungen",
      "desc": "Verfolgen Sie Wartungsbenachrichtigungen, neue Funktionen und wichtige Updates über das <strong>Ankündigungen</strong>-Board.",
      "read_announcements_title": "Ankündigungen lesen",
      "read_announcements_desc": "Ankündigungen sind von neu nach alt sortiert.",
      "read_item1": "Klicken Sie auf das Glocken-Symbol im linken Menü, um Ankündigungen anzuzeigen.",
      "read_item2": "Ungelesene Ankündigungen sind mit einem Benachrichtigungspunkt markiert.",
      "read_item3": "Klicken Sie auf eine Ankündigung, um alle Details zu lesen.",
      "types_title": "Arten von Ankündigungen",
      "types_desc": "Ankündigungen sind nach ihrem Inhalt kategorisiert.",
      "type1": "<strong>Systemwartung:</strong> Geplante Ausfallzeiten oder Leistungsupdates.",
      "type2": "<strong>Neue Funktionen:</strong> Ankündigungen über neu hinzugefügte Module.",
      "type3": "<strong>Allgemein:</strong> Unternehmensnachrichten oder Kampagneninformationen.",
      "tip_title": "E-Mail-Benachrichtigungen",
      "tip_desc": "Kritische Ankündigungen zur Systemwartung werden auch an Ihre registrierte E-Mail-Adresse gesendet."
    },
    "help.docs.customer.ai_assistant_overview": {
      "title": "KI-Assistent",
      "desc": "Der KI-Assistent scannt in Sekundenschnelle die gesamte Wissensdatenbank von Aluplan, um Lösungen für Ihre Probleme zu finden und Wartezeiten auf Support-Tickets zu vermeiden.",
      "usage_title": "Wie benutzt man es?",
      "usage_step1_title": "1. Gehen Sie zur KI-Assistent-Seite",
      "usage_step1_desc": "Klicken Sie im linken Menü auf den Link <strong>KI-Assistent</strong>.",
      "usage_step2_title": "2. Schreiben Sie Ihre Frage",
      "usage_step2_desc": "Geben Sie den Fehler, den Sie erhalten haben, oder das Thema, das Sie lernen möchten, in das Nachrichtenfeld ein.",
      "usage_step3_title": "3. Überprüfen Sie die Antwort",
      "usage_step3_desc": "Die KI liefert direkt Lösungsschritte, indem sie die Wissensdatenbank durchsucht. Wenn keine Lösung gefunden wird, wird vorgeschlagen, ein Support-Ticket zu erstellen.",
      "rag_title": "Was ist der RAG-Mechanismus?",
      "rag_desc": "Der KI-Assistent verwendet die <strong>RAG (Retrieval-Augmented Generation)</strong>-Technologie. Dies bedeutet, dass der Assistent den Wissenspool des Unternehmens scannt, bevor er eine Antwort generiert.",
      "rag_item1": "Ihre Suchanfrage wird über eine Vektorsuche mit relevanten Dokumenten abgeglichen.",
      "rag_item2": "Aus den übereinstimmenden Dokumenten wird eine kontextbezogene Antwort generiert.",
      "rag_item3": "Die Quelldokumente werden unter der Antwort aufgeführt.",
      "tip_rag_title": "Für bessere Ergebnisse",
      "tip_rag_desc": "Geben Sie in Ihren Fragen den Namen des Softwaremoduls an (z. B. <code>AX3000</code>). Dadurch kann die KI genauere Ergebnisse finden.",
      "no_answer_title": "Was passiert, wenn keine Antwort gefunden wird?",
      "no_answer_desc": "Wenn der KI-Assistent keine geeignete Antwort auf Ihre Frage finden kann, schlägt er automatisch vor, <strong>ein Support-Ticket zu erstellen</strong>.",
      "tip_no_answer_title": "Info",
      "tip_no_answer_desc": "Durch Klicken auf die Schaltfläche 'Nein, Ticket erstellen' können Sie ein Support-Ticket-Formular öffnen, das bereits mit dem von der KI verstandenen Kontext vorausgefüllt ist."
    },
    "help.docs.customer.ai_assistant_tips": {
      "title": "Tipps für effektive Fragen",
      "desc": "Erfahren Sie, wie Sie Ihre Fragen formulieren müssen, um die besten Ergebnisse vom KI-Assistenten zu erhalten.",
      "do_title": "Tun ✅",
      "do_item1_title": "Geben Sie den Modulnamen an",
      "do_item1_desc": "Schreiben Sie, mit welchem Allplan-Modul Sie Probleme haben.",
      "do_item2_title": "Kopieren Sie die Fehlermeldung",
      "do_item2_desc": "Fügen Sie die genaue Fehlermeldung ein, die Sie auf dem Bildschirm sehen.",
      "do_item3_title": "Beschreiben Sie die Schritte",
      "do_item3_desc": "Geben Sie an, bei welchem Vorgang der Fehler aufgetreten ist.",
      "dont_title": "Nicht tun ❌",
      "dont_item1_title": "Stellen Sie keine sehr allgemeinen Fragen",
      "dont_item1_desc": "Welches Programm? Wie funktioniert es nicht?",
      "dont_item2_title": "Stellen Sie nicht mehrere Themen in einer Frage",
      "dont_item2_desc": "",
      "tip_pro_title": "Pro-Tipp",
      "tip_pro_desc": "Wenn Sie Ihre Frage auf Englisch stellen, kann die KI möglicherweise auf eine breitere Wissensbasis zugreifen. Fragen auf Türkisch und Deutsch werden jedoch ebenfalls vollständig unterstützt."
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
