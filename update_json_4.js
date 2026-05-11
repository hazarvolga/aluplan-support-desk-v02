const fs = require('fs');
const path = require('path');

const locales = ['en', 'tr', 'de'];
const basePath = path.join(__dirname, 'apps/frontend/messages');

const translations = {
  en: {
    "help.docs.admin.team_customers": {
      "title": "Customer Approval",
      "desc": "Approve newly registered customers, manage CRM verification, and update customer profiles.",
      "process_title": "Customer Approval Process",
      "step1_title": "1. Go to the Customers page",
      "step1_desc": "Click the <strong>Customers</strong> link from the left menu.",
      "step2_title": "2. Filter pending customers",
      "step2_desc": "List customers waiting for approval by selecting the <strong>Unverified</strong> option from the status filter.",
      "step3_title": "3. Review and approve the customer",
      "step3_desc": "Open the customer profile, verify the CRM information, and click the <strong>Approve</strong> button.",
      "crm_title": "CRM Verification",
      "crm_desc": "If Dynamics 365 integration is active, customer registration is automatically matched with the CRM database.",
      "crm_ok": "<strong>DYNAMICS_OK:</strong> Match found in CRM.",
      "crm_manual": "<strong>MANUAL_ENTRY:</strong> No record in CRM, manual approval required.",
      "crm_not_found": "<strong>NOT_FOUND:</strong> Customer could not be found in CRM.",
      "tip_bulk_title": "Bulk Verification",
      "tip_bulk_desc": "You can initiate bulk email verification by selecting multiple customers. This allows you to process large customer lists quickly."
    },
    "help.docs.admin.ai_knowledge_pool": {
      "title": "Knowledge Pool Management",
      "desc": "To enable AI to generate accurate answers, you must keep the Knowledge Pool constantly updated. You can add data using three different methods.",
      "pdf_title": "PDF / File Upload",
      "pdf_desc": "Add technical specifications, user manuals, and other documents directly to the database as PDFs.",
      "pdf_item1": "The system automatically divides the PDF into <strong>Embedding (Vector)</strong> chunks.",
      "pdf_item2": "Supported formats: PDF, DOCX, TXT, MD.",
      "pdf_item3": "Once the upload is complete, AI can immediately use this content.",
      "scraper_title": "Web Scraper",
      "scraper_desc": "When you provide up-to-date \"How To\" URLs to the system, AI reads your website and saves it to its memory.",
      "scraper_item1": "Add a URL, the system scans the page automatically.",
      "scraper_item2": "Content can be kept up to date with periodic refresh.",
      "scraper_tip": "Only publicly accessible URLs can be scanned. Pages requiring login are not supported.",
      "raw_title": "Raw Text",
      "raw_desc": "You can create \"Instructions\" for AI by manually entering frequently asked questions and their answers.",
      "raw_item1": "Enter content in Q&A format.",
      "raw_item2": "Ideal for company policies and procedures.",
      "tip_quality_title": "Quality Data = Quality Response",
      "tip_quality_desc": "The quality of the content you add to the Knowledge Pool directly affects the quality of AI responses. Add up-to-date, accurate, and comprehensive documents."
    },
    "help.docs.admin.ai_learning_cycle": {
      "title": "Learning Cycle",
      "desc": "AI automatically learns from closed tickets. This cycle ensures that more accurate and faster responses are generated over time.",
      "works_title": "How Does the Learning Cycle Work?",
      "step1_title": "Customer gives 5 stars",
      "step1_desc": "When a closed ticket is rated 5 stars by the customer, the system marks this solution as \"excellent\".",
      "step2_title": "Enters AI Approvals queue",
      "step2_desc": "The solution is not directly written to the main database. It is first sent to the KB Approvals tab.",
      "step3_title": "Admin approves or rejects",
      "step3_desc": "You can choose to let AI learn this solution (Approve) or skip it (Reject).",
      "step4_title": "Approved solution is added to Knowledge Pool",
      "step4_desc": "The approved solution is added to the vector database and used for similar questions in the future.",
      "faq_title": "Automated FAQ Extraction",
      "faq_desc": "You can manually trigger the learning cycle from the <strong>FAQ Management</strong> page. The system analyzes closed tickets and automatically extracts frequently asked questions.",
      "faq_item1": "Trigger the pipeline with the \"Start Extraction\" button.",
      "faq_item2": "Extracted FAQ candidates fall into the review queue.",
      "faq_item3": "Approved FAQs are added to the knowledge base.",
      "tip_active_title": "Keep the Cycle Active",
      "tip_active_desc": "Encourage customers to give a satisfaction score when the ticket is closed to keep the learning cycle running effectively."
    },
    "help.docs.admin.ai_approvals": {
      "title": "AI Approvals (KB Approvals)",
      "desc": "5-star solutions and FAQ candidates pass through admin approval before being added to the main database. This maintains information quality.",
      "workflow_title": "Approval Workflow",
      "step1_title": "1. Go to KB Approvals page",
      "step1_desc": "Click the <strong>KB Approvals</strong> link from the left menu.",
      "step2_title": "2. Review candidates",
      "step2_desc": "For each candidate, the source ticket, suggested Q&A pair, and confidence score are displayed.",
      "step3_title": "3. Approve or Reject",
      "step3_desc1": "<strong>Approve</strong> — The solution is added to the Knowledge Pool and begins to be used by AI.",
      "step3_desc2": "<strong>Reject</strong> — The solution is skipped and not added to the database.",
      "score_title": "Confidence Score",
      "score_desc": "The system calculates a confidence score for each candidate. A high score indicates that the solution strongly matches similar questions.",
      "score_high": "High",
      "score_high_desc": "Can be confidently approved",
      "score_med": "Medium",
      "score_med_desc": "Review recommended",
      "score_low": "Low",
      "score_low_desc": "Evaluate carefully",
      "tip_qa_title": "Quality Control",
      "tip_qa_desc": "Read the source ticket before approving. Make sure the solution is genuinely accurate and repeatable.",
      "bulk_title": "Bulk Actions",
      "bulk_item1": "You can perform bulk approval or rejection by selecting multiple candidates.",
      "bulk_item2": "View candidates in a specific product or category using filters."
    },
    "help.docs.admin.ai_faq": {
      "title": "FAQ Management",
      "desc": "The system automatically extracts frequently asked questions from closed tickets. From this page, you can review, publish, or reject FAQ candidates.",
      "process_title": "FAQ Extraction Process",
      "auto_title": "Automatic Extraction",
      "auto_desc": "The system periodically analyzes closed tickets and marks recurring questions as FAQ candidates.",
      "manual_title": "Manual Triggering",
      "manual_desc": "You can run the pipeline manually with the <strong>Start Extraction</strong> button.",
      "status_title": "FAQ Statuses",
      "status_pending": "Pending Review",
      "status_pending_desc": "Candidates not yet evaluated",
      "status_published": "Published",
      "status_published_desc": "Approved and active FAQs",
      "status_draft": "Draft",
      "status_draft_desc": "Rejected or pending content",
      "approval_title": "FAQ Approval",
      "approval_item1": "<strong>Approve</strong> — FAQ is published and added to the knowledge base.",
      "approval_item2": "<strong>Reject</strong> — FAQ moves to draft/deleted status.",
      "approval_item3": "Confidence score and source ticket info are displayed for each candidate.",
      "tip_cycle_title": "FAQ Learning Cycle",
      "tip_cycle_desc": "FAQ Management and KB Approvals work together. Check both pages regularly for the complete learning cycle."
    }
  },
  tr: {
    "help.docs.admin.team_customers": {
      "title": "Müşteri Onaylama",
      "desc": "Yeni kayıt olan müşterileri onaylayın, CRM doğrulamasını yönetin ve müşteri profillerini güncelleyin.",
      "process_title": "Müşteri Onay Süreci",
      "step1_title": "1. Müşteriler sayfasına gidin",
      "step1_desc": "Sol menüden <strong>Müşteriler</strong> bağlantısına tıklayın.",
      "step2_title": "2. Bekleyen müşterileri filtreleyin",
      "step2_desc": "Durum filtresinden <strong>Doğrulanmamış</strong> seçeneğini seçerek onay bekleyen müşterileri listeleyin.",
      "step3_title": "3. Müşteriyi inceleyin ve onaylayın",
      "step3_desc": "Müşteri profilini açın, CRM bilgilerini doğrulayın ve <strong>Onayla</strong> butonuna tıklayın.",
      "crm_title": "CRM Doğrulama",
      "crm_desc": "Dynamics 365 entegrasyonu aktifse, müşteri kaydı otomatik olarak CRM veritabanıyla eşleştirilir.",
      "crm_ok": "<strong>DYNAMICS_OK:</strong> CRM'de eşleşme bulundu.",
      "crm_manual": "<strong>MANUAL_ENTRY:</strong> CRM'de kayıt yok, manuel onay gerekli.",
      "crm_not_found": "<strong>NOT_FOUND:</strong> Müşteri CRM'de bulunamadı.",
      "tip_bulk_title": "Toplu Doğrulama",
      "tip_bulk_desc": "Birden fazla müşteriyi seçerek toplu e-posta doğrulama işlemi başlatabilirsiniz. Bu, büyük müşteri listelerini hızlıca işlemenizi sağlar."
    },
    "help.docs.admin.ai_knowledge_pool": {
      "title": "Knowledge Pool Yönetimi",
      "desc": "AI'ın doğru yanıtlar üretebilmesi için Knowledge Pool'u sürekli güncel tutmanız gerekir. Üç farklı yöntemle veri ekleyebilirsiniz.",
      "pdf_title": "PDF / Dosya Yükleme",
      "pdf_desc": "Teknik şartnameleri, kullanım kılavuzlarını ve diğer belgeleri PDF olarak doğrudan veritabanına ekleyin.",
      "pdf_item1": "Sistem, PDF'i otomatik olarak <strong>Embedding (Vektör)</strong> parçalarına böler.",
      "pdf_item2": "Desteklenen formatlar: PDF, DOCX, TXT, MD.",
      "pdf_item3": "Yükleme tamamlandıktan sonra AI hemen bu içeriği kullanabilir.",
      "scraper_title": "Web Scraper",
      "scraper_desc": "Güncel \"Nasıl Yapılır\" URL'lerini sisteme sağladığınızda, AI web sitenizi okuyarak belleğine kaydeder.",
      "scraper_item1": "URL ekleyin, sistem sayfayı otomatik olarak tarar.",
      "scraper_item2": "Periyodik yenileme ile içerik güncel tutulabilir.",
      "scraper_tip": "Yalnızca kamuya açık ve erişilebilir URL'ler taranabilir. Giriş gerektiren sayfalar desteklenmez.",
      "raw_title": "Ham Metin (Raw Text)",
      "raw_desc": "Sık sorulan soruları ve yanıtlarını manuel olarak girerek AI için \"Talimatlar\" oluşturabilirsiniz.",
      "raw_item1": "Soru-cevap formatında içerik girin.",
      "raw_item2": "Şirket politikaları ve prosedürler için idealdir.",
      "tip_quality_title": "Kaliteli Veri = Kaliteli Yanıt",
      "tip_quality_desc": "Knowledge Pool'a eklediğiniz içeriklerin kalitesi, AI'ın yanıt kalitesini doğrudan etkiler. Güncel, doğru ve kapsamlı belgeler ekleyin."
    },
    "help.docs.admin.ai_learning_cycle": {
      "title": "Öğrenme Döngüsü",
      "desc": "AI, kapatılan biletlerden otomatik olarak öğrenir. Bu döngü, zamanla daha doğru ve hızlı yanıtlar üretilmesini sağlar.",
      "works_title": "Öğrenme Döngüsü Nasıl Çalışır?",
      "step1_title": "Müşteri 5 yıldız verir",
      "step1_desc": "Kapatılan bir bilet müşteri tarafından 5 yıldızla değerlendirildiğinde, sistem bu çözümü \"mükemmel\" olarak işaretler.",
      "step2_title": "AI Onayları kuyruğuna girer",
      "step2_desc": "Çözüm, doğrudan ana veritabanına yazılmaz. Önce KB Onayları (AI Approvals) sekmesine gönderilir.",
      "step3_title": "Admin onaylar veya reddeder",
      "step3_desc": "Siz bu çözümün AI tarafından öğrenilmesini (Onayla) veya atlanmasını (Reddet) seçebilirsiniz.",
      "step4_title": "Onaylanan çözüm Knowledge Pool'a eklenir",
      "step4_desc": "Onaylanan çözüm vektör veritabanına eklenir ve gelecekteki benzer sorularda kullanılır.",
      "faq_title": "FAQ Otomatik Çıkarma",
      "faq_desc": "<strong>FAQ Yönetimi</strong> sayfasından öğrenme döngüsünü manuel olarak tetikleyebilirsiniz. Sistem, kapatılan biletleri analiz ederek sık sorulan soruları otomatik çıkarır.",
      "faq_item1": "\"Çıkarma Başlat\" butonuyla pipeline'ı tetikleyin.",
      "faq_item2": "Çıkarılan FAQ adayları inceleme kuyruğuna düşer.",
      "faq_item3": "Onaylanan FAQ'lar bilgi bankasına eklenir.",
      "tip_active_title": "Döngüyü Aktif Tutun",
      "tip_active_desc": "Öğrenme döngüsünün etkin çalışması için müşterileri bilet kapatıldığında memnuniyet puanı vermeye teşvik edin."
    },
    "help.docs.admin.ai_approvals": {
      "title": "AI Onayları (KB Approvals)",
      "desc": "5 yıldızlı çözümler ve FAQ adayları, ana veritabanına eklenmeden önce admin onayından geçer. Bu sayede bilgi kalitesi korunur.",
      "workflow_title": "Onay İş Akışı",
      "step1_title": "1. KB Onayları sayfasına gidin",
      "step1_desc": "Sol menüden <strong>KB Onayları</strong> bağlantısına tıklayın.",
      "step2_title": "2. Adayları inceleyin",
      "step2_desc": "Her aday için kaynak bilet, önerilen soru-cevap çifti ve güven skoru görüntülenir.",
      "step3_title": "3. Onayla veya Reddet",
      "step3_desc1": "<strong>Onayla</strong> — Çözüm Knowledge Pool'a eklenir ve AI tarafından kullanılmaya başlanır.",
      "step3_desc2": "<strong>Reddet</strong> — Çözüm atlanır, veritabanına eklenmez.",
      "score_title": "Güven Skoru",
      "score_desc": "Her aday için sistem bir güven skoru hesaplar. Yüksek skor, çözümün benzer sorularla güçlü eşleşme gösterdiğini belirtir.",
      "score_high": "Yüksek",
      "score_high_desc": "Güvenle onaylanabilir",
      "score_med": "Orta",
      "score_med_desc": "İnceleme önerilir",
      "score_low": "Düşük",
      "score_low_desc": "Dikkatli değerlendirin",
      "tip_qa_title": "Kalite Kontrolü",
      "tip_qa_desc": "Onaylamadan önce kaynak bileti okuyun. Çözümün gerçekten doğru ve tekrarlanabilir olduğundan emin olun.",
      "bulk_title": "Toplu İşlemler",
      "bulk_item1": "Birden fazla adayı seçerek toplu onay veya red işlemi yapabilirsiniz.",
      "bulk_item2": "Filtreler ile belirli ürün veya kategorideki adayları görüntüleyin."
    },
    "help.docs.admin.ai_faq": {
      "title": "FAQ Yönetimi",
      "desc": "Sistem, kapatılan biletlerden otomatik olarak sık sorulan soruları çıkarır. Bu sayfadan FAQ adaylarını inceleyebilir, yayınlayabilir veya reddedebilirsiniz.",
      "process_title": "FAQ Çıkarma Süreci",
      "auto_title": "Otomatik Çıkarma",
      "auto_desc": "Sistem periyodik olarak kapatılan biletleri analiz eder ve tekrar eden soruları FAQ adayı olarak işaretler.",
      "manual_title": "Manuel Tetikleme",
      "manual_desc": "<strong>Çıkarma Başlat</strong> butonuyla pipeline'ı manuel olarak çalıştırabilirsiniz.",
      "status_title": "FAQ Durumları",
      "status_pending": "İnceleme Bekliyor",
      "status_pending_desc": "Henüz değerlendirilmemiş adaylar",
      "status_published": "Yayınlandı",
      "status_published_desc": "Onaylanmış ve aktif FAQ'lar",
      "status_draft": "Taslak",
      "status_draft_desc": "Reddedilmiş veya beklemedeki içerikler",
      "approval_title": "FAQ Onaylama",
      "approval_item1": "<strong>Onayla</strong> — FAQ yayınlanır ve bilgi bankasına eklenir.",
      "approval_item2": "<strong>Reddet</strong> — FAQ taslak/silinmiş durumuna geçer.",
      "approval_item3": "Güven skoru ve kaynak bilet bilgisi her aday için görüntülenir.",
      "tip_cycle_title": "FAQ Öğrenme Döngüsü",
      "tip_cycle_desc": "FAQ Yönetimi ve KB Onayları birlikte çalışır. Öğrenme döngüsünün tamamı için her iki sayfayı da düzenli olarak kontrol edin."
    }
  },
  de: {
    "help.docs.admin.team_customers": {
      "title": "Kundenfreigabe",
      "desc": "Genehmigen Sie neu registrierte Kunden, verwalten Sie die CRM-Überprüfung und aktualisieren Sie Kundenprofile.",
      "process_title": "Kundenfreigabeprozess",
      "step1_title": "1. Gehen Sie zur Seite Kunden",
      "step1_desc": "Klicken Sie im linken Menü auf den Link <strong>Kunden</strong>.",
      "step2_title": "2. Ausstehende Kunden filtern",
      "step2_desc": "Listen Sie auf Genehmigung wartende Kunden auf, indem Sie die Option <strong>Nicht verifiziert</strong> aus dem Statusfilter auswählen.",
      "step3_title": "3. Kunden überprüfen und genehmigen",
      "step3_desc": "Öffnen Sie das Kundenprofil, überprüfen Sie die CRM-Informationen und klicken Sie auf die Schaltfläche <strong>Genehmigen</strong>.",
      "crm_title": "CRM-Überprüfung",
      "crm_desc": "Wenn die Integration von Dynamics 365 aktiv ist, wird die Kundenregistrierung automatisch mit der CRM-Datenbank abgeglichen.",
      "crm_ok": "<strong>DYNAMICS_OK:</strong> Übereinstimmung im CRM gefunden.",
      "crm_manual": "<strong>MANUAL_ENTRY:</strong> Kein Eintrag im CRM, manuelle Genehmigung erforderlich.",
      "crm_not_found": "<strong>NOT_FOUND:</strong> Kunde konnte im CRM nicht gefunden werden.",
      "tip_bulk_title": "Massenüberprüfung",
      "tip_bulk_desc": "Sie können eine Massen-E-Mail-Überprüfung initiieren, indem Sie mehrere Kunden auswählen. Dadurch können Sie große Kundenlisten schnell verarbeiten."
    },
    "help.docs.admin.ai_knowledge_pool": {
      "title": "Knowledge Pool Management",
      "desc": "Damit KI genaue Antworten generieren kann, müssen Sie den Knowledge Pool ständig auf dem neuesten Stand halten. Sie können Daten mit drei verschiedenen Methoden hinzufügen.",
      "pdf_title": "PDF / Datei-Upload",
      "pdf_desc": "Fügen Sie technische Spezifikationen, Benutzerhandbücher und andere Dokumente direkt als PDFs in die Datenbank ein.",
      "pdf_item1": "Das System teilt die PDF automatisch in <strong>Embedding (Vector)</strong> Chunks auf.",
      "pdf_item2": "Unterstützte Formate: PDF, DOCX, TXT, MD.",
      "pdf_item3": "Sobald der Upload abgeschlossen ist, kann die KI diesen Inhalt sofort nutzen.",
      "scraper_title": "Web-Scraper",
      "scraper_desc": "Wenn Sie dem System aktuelle \"How To\"-URLs zur Verfügung stellen, liest KI Ihre Website und speichert sie im Gedächtnis.",
      "scraper_item1": "URL hinzufügen, das System scannt die Seite automatisch.",
      "scraper_item2": "Der Inhalt kann durch regelmäßige Aktualisierung auf dem neuesten Stand gehalten werden.",
      "scraper_tip": "Es können nur öffentlich zugängliche URLs gescannt werden. Anmeldepflichtige Seiten werden nicht unterstützt.",
      "raw_title": "Rohtext",
      "raw_desc": "Sie können \"Anweisungen\" für KI erstellen, indem Sie häufig gestellte Fragen und deren Antworten manuell eingeben.",
      "raw_item1": "Inhalte im Q&A-Format eingeben.",
      "raw_item2": "Ideal für Unternehmensrichtlinien und -verfahren.",
      "tip_quality_title": "Qualitätsdaten = Qualitätsantwort",
      "tip_quality_desc": "Die Qualität der Inhalte, die Sie dem Knowledge Pool hinzufügen, wirkt sich direkt auf die Qualität der KI-Antworten aus. Fügen Sie aktuelle, genaue und umfassende Dokumente hinzu."
    },
    "help.docs.admin.ai_learning_cycle": {
      "title": "Lernzyklus",
      "desc": "KI lernt automatisch aus geschlossenen Tickets. Dieser Zyklus stellt sicher, dass im Laufe der Zeit genauere und schnellere Antworten generiert werden.",
      "works_title": "Wie funktioniert der Lernzyklus?",
      "step1_title": "Kunde gibt 5 Sterne",
      "step1_desc": "Wenn ein geschlossenes Ticket vom Kunden mit 5 Sternen bewertet wird, markiert das System diese Lösung als \"exzellent\".",
      "step2_title": "Gibt die KI-Genehmigungswarteschlange ein",
      "step2_desc": "Die Lösung wird nicht direkt in die Hauptdatenbank geschrieben. Es wird zunächst an den Reiter KB-Genehmigungen gesendet.",
      "step3_title": "Admin genehmigt oder lehnt ab",
      "step3_desc": "Sie können festlegen, ob KI diese Lösung erlernen soll (Genehmigen) oder sie überspringen soll (Ablehnen).",
      "step4_title": "Genehmigte Lösung wird dem Knowledge Pool hinzugefügt",
      "step4_desc": "Die genehmigte Lösung wird der Vektordatenbank hinzugefügt und in Zukunft für ähnliche Fragen verwendet.",
      "faq_title": "Automatisierte FAQ-Extraktion",
      "faq_desc": "Sie können den Lernzyklus manuell auf der Seite <strong>FAQ-Verwaltung</strong> auslösen. Das System analysiert geschlossene Tickets und extrahiert automatisch häufig gestellte Fragen.",
      "faq_item1": "Lösen Sie die Pipeline mit der Schaltfläche \"Extraktion starten\" aus.",
      "faq_item2": "Extrahierte FAQ-Kandidaten fallen in die Überprüfungswarteschlange.",
      "faq_item3": "Genehmigte FAQs werden der Wissensdatenbank hinzugefügt.",
      "tip_active_title": "Halten Sie den Zyklus aktiv",
      "tip_active_desc": "Ermutigen Sie Kunden, beim Schließen des Tickets eine Zufriedenheitsbewertung abzugeben, damit der Lernzyklus effektiv läuft."
    },
    "help.docs.admin.ai_approvals": {
      "title": "KI-Genehmigungen (KB-Genehmigungen)",
      "desc": "5-Sterne-Lösungen und FAQ-Kandidaten durchlaufen die Admin-Genehmigung, bevor sie der Hauptdatenbank hinzugefügt werden. Dies erhält die Informationsqualität.",
      "workflow_title": "Genehmigungs-Workflow",
      "step1_title": "1. Gehen Sie zur Seite KB-Genehmigungen",
      "step1_desc": "Klicken Sie im linken Menü auf den Link <strong>KB-Genehmigungen</strong>.",
      "step2_title": "2. Kandidaten prüfen",
      "step2_desc": "Für jeden Kandidaten werden das Quell-Ticket, das vorgeschlagene F&A-Paar und der Konfidenz-Score angezeigt.",
      "step3_title": "3. Genehmigen oder ablehnen",
      "step3_desc1": "<strong>Genehmigen</strong> — Die Lösung wird dem Knowledge Pool hinzugefügt und von der KI genutzt.",
      "step3_desc2": "<strong>Ablehnen</strong> — Die Lösung wird übersprungen und nicht zur Datenbank hinzugefügt.",
      "score_title": "Konfidenz-Score",
      "score_desc": "Das System berechnet für jeden Kandidaten einen Konfidenz-Score. Ein hoher Score zeigt an, dass die Lösung stark mit ähnlichen Fragen übereinstimmt.",
      "score_high": "Hoch",
      "score_high_desc": "Kann souverän zugelassen werden",
      "score_med": "Mittel",
      "score_med_desc": "Überprüfung empfohlen",
      "score_low": "Niedrig",
      "score_low_desc": "Sorgfältig auswerten",
      "tip_qa_title": "Qualitätskontrolle",
      "tip_qa_desc": "Lesen Sie das Quell-Ticket vor der Genehmigung. Stellen Sie sicher, dass die Lösung wirklich genau und wiederholbar ist.",
      "bulk_title": "Massenaktionen",
      "bulk_item1": "Sie können Massengenehmigungen oder -ablehnungen durchführen, indem Sie mehrere Kandidaten auswählen.",
      "bulk_item2": "Zeigen Sie Kandidaten in einem bestimmten Produkt oder einer bestimmten Kategorie mithilfe von Filtern an."
    },
    "help.docs.admin.ai_faq": {
      "title": "FAQ-Management",
      "desc": "Das System extrahiert automatisch häufig gestellte Fragen aus geschlossenen Tickets. Auf dieser Seite können Sie FAQ-Kandidaten überprüfen, veröffentlichen oder ablehnen.",
      "process_title": "FAQ-Extraktionsprozess",
      "auto_title": "Automatische Extraktion",
      "auto_desc": "Das System analysiert in regelmäßigen Abständen geschlossene Tickets und markiert wiederkehrende Fragen als FAQ-Kandidaten.",
      "manual_title": "Manuelle Auslösung",
      "manual_desc": "Sie können die Pipeline manuell mit der Schaltfläche <strong>Extraktion starten</strong> ausführen.",
      "status_title": "FAQ-Status",
      "status_pending": "Ausstehende Überprüfung",
      "status_pending_desc": "Noch nicht bewertete Kandidaten",
      "status_published": "Veröffentlicht",
      "status_published_desc": "Genehmigte und aktive FAQs",
      "status_draft": "Entwurf",
      "status_draft_desc": "Abgelehnte oder ausstehende Inhalte",
      "approval_title": "FAQ-Genehmigung",
      "approval_item1": "<strong>Genehmigen</strong> — FAQ wird veröffentlicht und der Wissensdatenbank hinzugefügt.",
      "approval_item2": "<strong>Ablehnen</strong> — FAQ wechselt in den Entwurfs-/gelöschten Status.",
      "approval_item3": "Konfidenz-Score und Quell-Ticket-Informationen werden für jeden Kandidaten angezeigt.",
      "tip_cycle_title": "FAQ-Lernzyklus",
      "tip_cycle_desc": "FAQ-Management und KB-Genehmigungen arbeiten zusammen. Überprüfen Sie regelmäßig beide Seiten auf den gesamten Lernzyklus."
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
