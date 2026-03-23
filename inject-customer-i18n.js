const fs = require('fs');
const path = require('path');

const locales = ['tr', 'en', 'de'];
const messagesPath = path.join(__dirname, 'apps/frontend/messages');

const newTranslations = {
    tr: {
        customers: {
            labels: {
                active: "AKTİF",
                passive: "PASİF",
                syncing: "SENKRONİZE EDİLİYOR",
                unknown: "BİLİNMEYEN",
                items: "Öğe",
                score: "Skor",
                total: "TOPLAM",
                passed: "BAŞARILI",
                failed: "HATALI",
                pending: "BEKLEMEDE",
                system_info: "Sistem Bilgileri (Hotinfo)",
                personal_info: "Kişisel Bilgiler",
                corporate_info: "Kurumsal Bilgiler",
                first_name: "Ad",
                last_name: "Soyad",
                job_title: "Görev / Unvan",
                phone: "Telefon",
                company_name: "Firma Adı",
                customer_no: "Müşteri Numarası",
                contract_status: "Müşteri Durumu",
                created_at: "Hesap Oluşturulma",
                save_all: "Tüm Değişiklikleri Kaydet",
                saving: "Kaydediliyor...",
                reset_password: "Şifreyi Sıfırla",
                reset_password_confirm: "Devam edilsin mi? Müşteriye yeni, rastgele bir şifre atanacaktır.",
                hotinfo_data: "Cihaz konfigürasyonu ve Allplan detayları",
                download_hxl: ".HXL İndir",
                general: "Genel"
            },
            crm: {
                title: "CRM Kontrol Merkezi",
                desc: "Microsoft Dynamics 365 ve Kurumsal CRM entegrasyonlarını yönetin.",
                connection_settings: "Dynamics 365 Bağlantı Ayarları",
                connection_desc: "Azure Portal üzerinden oluşturduğunuz uygulama (App Registration) bilgilerini buraya girin.",
                status_card_title: "Bağlantı Durumu",
                last_sync: "Son Senkronizasyon",
                never_synced: "Hiç yapılmadı",
                sync_btn: "Şimdi Senkronize Et",
                success: "Başarılı",
                error: "Hata",
                in_progress: "Devam Ediyor",
                ready: "Hazır",
                log_title: "Senkronizasyon Günlüğü",
                log_empty: "İşlem kaydı bulunmuyor.",
                save_and_verify: "Bağlantıyı Kaydet ve Doğrula"
            },
            import: {
                title: "Müşterileri İçe Aktar",
                subtitle: "Dynamics 365 verilerini sisteme senkronize edin",
                select_file: "CSV Dosyanızı Seçin",
                file_hint: "Client ID ve Şirket bilgilerinin dolu olduğundan emin olun. Eksik veriler geçici kodlarla oluşturulacaktır.",
                select_btn: "Dosya Seç (CSV/Semicolon)",
                processing: "İşleniyor...",
                analysis_complete: "Veri Analizi Tamamlandı",
                missing_client_no: "Müşteri No Eksik",
                missing_company: "Şirket Adı Eksik",
                attention: "DİKKAT:",
                attention_desc: "Eksik 'Client ID' verisi olan kullanıcılar, CRM doğrulaması yapılmadan içe aktarılacaktır. Eksik şirket bilgileri 'Bilinmeyen Firma' olarak işaretlenecektir.",
                cancel: "Vazgeç",
                start_import: "Şimdi İçe Aktar",
                writing_data: "Veriler Yazılıyor...",
                summary_title: "İçe Aktarma Özeti",
                new_upload: "Yeni Yükleme",
                go_to_customers: "Müşterilere Git"
            },
            confirm: {
                delete_title: "Sistem Protokolü: Silme Onayı",
                delete_desc: "{count} adet veri nesnesi kalıcı olarak silinecek. Bu işlem geri alınamaz.",
                delete_confirm: "SİLME PROTOKOLÜNÜ BAŞLAT",
                cancel: "İPTAL"
            }
        }
    },
    en: {
        customers: {
            labels: {
                active: "ACTIVE",
                passive: "PASSIVE",
                syncing: "SYNCING",
                unknown: "UNKNOWN",
                items: "Items",
                score: "Score",
                total: "TOTAL",
                passed: "PASSED",
                failed: "FAILED",
                pending: "PENDING",
                system_info: "System Information (Hotinfo)",
                personal_info: "Personal Information",
                corporate_info: "Corporate Information",
                first_name: "First Name",
                last_name: "Last Name",
                job_title: "Job Title",
                phone: "Phone",
                company_name: "Company Name",
                customer_no: "Customer Number",
                contract_status: "Customer Status",
                created_at: "Account Created",
                save_all: "Save All Changes",
                saving: "Saving...",
                reset_password: "Reset Password",
                reset_password_confirm: "Continue? A new, random password will be assigned to the customer.",
                hotinfo_data: "Device configuration and Allplan details",
                download_hxl: "Download .HXL",
                general: "General"
            },
            crm: {
                title: "CRM Control Center",
                desc: "Manage Microsoft Dynamics 365 and Enterprise CRM integrations.",
                connection_settings: "Dynamics 365 Connection Settings",
                connection_desc: "Enter the application (App Registration) information you created via the Azure Portal here.",
                status_card_title: "Connection Status",
                last_sync: "Last Sync",
                never_synced: "Never performed",
                sync_btn: "Sync Now",
                success: "Success",
                error: "Error",
                in_progress: "In Progress",
                ready: "Ready",
                log_title: "Sync Log",
                log_empty: "No activity records found.",
                save_and_verify: "Save and Verify Connection"
            },
            import: {
                title: "Import Customers",
                subtitle: "Sync Dynamics 365 data into the system",
                select_file: "Select Your CSV File",
                file_hint: "Ensure Client ID and Company information are filled. Missing data will be created with temporary codes.",
                select_btn: "Select File (CSV/Semicolon)",
                processing: "Processing...",
                analysis_complete: "Data Analysis Complete",
                missing_client_no: "Missing Customer No",
                missing_company: "Missing Company Name",
                attention: "ATTENTION:",
                attention_desc: "Users with missing 'Client ID' data will be imported without CRM verification. Missing company info will be marked as 'Unknown Company'.",
                cancel: "Cancel",
                start_import: "Import Now",
                writing_data: "Writing Data...",
                summary_title: "Import Summary",
                new_upload: "New Upload",
                go_to_customers: "Go to Customers"
            },
            confirm: {
                delete_title: "System Protocol: Delete Confirmation",
                delete_desc: "{count} data objects will be permanently deleted. This action cannot be undone.",
                delete_confirm: "START DELETE PROTOCOL",
                cancel: "CANCEL"
            }
        }
    },
    de: {
        customers: {
            labels: {
                active: "AKTIV",
                passive: "PASSIV",
                syncing: "SYNCHRONISIERUNG",
                unknown: "UNBEKANNT",
                items: "Elemente",
                score: "Score",
                total: "GESAMT",
                passed: "ERFOLGREICH",
                failed: "FEHLGESCHLAGEN",
                pending: "AUSSTEHEND",
                system_info: "Systeminformationen (Hotinfo)",
                personal_info: "Persönliche Informationen",
                corporate_info: "Unternehmensinformationen",
                first_name: "Vorname",
                last_name: "Nachname",
                job_title: "Jobtitel",
                phone: "Telefon",
                company_name: "Firmenname",
                customer_no: "Kundennummer",
                contract_status: "Kundenstatus",
                created_at: "Konto erstellt",
                save_all: "Alle Änderungen speichern",
                saving: "Speichern...",
                reset_password: "Passwort zurücksetzen",
                reset_password_confirm: "Fortfahren? Dem Kunden wird ein neues, zufälliges Passwort zugewiesen.",
                hotinfo_data: "Gerätekonfiguration und Allplan-Details",
                download_hxl: ".HXL herunterladen",
                general: "Allgemein"
            },
            crm: {
                title: "CRM-Kontrollzentrum",
                desc: "Verwalten Sie Microsoft Dynamics 365- und Unternehmens-CRM-Integrationen.",
                connection_settings: "Dynamics 365 Verbindungseinstellungen",
                connection_desc: "Geben Sie hier die Anwendungsinformationen (App Registration) ein, die Sie über das Azure-Portal erstellt haben.",
                status_card_title: "Verbindungsstatus",
                last_sync: "Letzte Synchronisierung",
                never_synced: "Nie durchgeführt",
                sync_btn: "Jetzt synchronisieren",
                success: "Erfolgreich",
                error: "Fehler",
                in_progress: "In Bearbeitung",
                ready: "Bereit",
                log_title: "Synchronisierungsprotokoll",
                log_empty: "Keine Aktivitätsdatensätze gefunden.",
                save_and_verify: "Verbindung speichern und überprüfen"
            },
            import: {
                title: "Kunden importieren",
                subtitle: "Synchronisieren Sie Dynamics 365-Daten mit dem System",
                select_file: "Wählen Sie Ihre CSV-Datei aus",
                file_hint: "Stellen Sie sicher, dass Kundennummer und Firmeninformationen ausgefüllt sind. Fehlende Daten werden mit temporären Codes erstellt.",
                select_btn: "Datei auswählen (CSV/Semikolon)",
                processing: "Verarbeitung...",
                analysis_complete: "Datenanalyse abgeschlossen",
                missing_client_no: "Kundennummer fehlt",
                missing_company: "Firmenname fehlt",
                attention: "ACHTUNG:",
                attention_desc: "Benutzer mit fehlenden 'Client ID'-Daten werden ohne CRM-Verifizierung importiert. Fehlende Firmeninfos werden als 'Unbekannte Firma' markiert.",
                cancel: "Abbrechen",
                start_import: "Jetzt importieren",
                writing_data: "Daten werden geschrieben...",
                summary_title: "Import-Zusammenfassung",
                new_upload: "Neuer Upload",
                go_to_customers: "Gehe zu Kunden"
            },
            confirm: {
                delete_title: "Systemprotokoll: Löschbestätigung",
                delete_desc: "{count} Datenobjekte werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
                delete_confirm: "LÖSCHPROTOKOLL STARTEN",
                cancel: "ABBRECHEN"
            }
        }
    }
};

locales.forEach(locale => {
    const filePath = path.join(messagesPath, `${locale}.json`);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Update or merge customers namespace
    content.customers = {
        ...content.customers,
        ...newTranslations[locale].customers,
        labels: {
            ...content.customers?.labels,
            ...newTranslations[locale].customers.labels
        },
        crm: {
            ...content.customers?.crm, // In case it existed
            ...newTranslations[locale].customers.crm
        },
        import: {
            ...content.customers?.import,
            ...newTranslations[locale].customers.import
        },
        confirm: {
            ...content.customers?.confirm,
            ...newTranslations[locale].customers.confirm
        }
    };

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
});

console.log('Customers module translations injected successfully for tr, en, de.');
