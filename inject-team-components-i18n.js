const fs = require('fs');
const path = require('path');

const locales = ['tr', 'en', 'de'];
const messagesDir = path.join(__dirname, 'apps/frontend/messages');

const newTranslations = {
    tr: {
        team_creation: {
            title: "Yeni Ekip Oluştur",
            description: "Operasyonel süreçleri yönetmek için yeni bir ekip tanımlayın.",
            team_name: "Ekip İsmi",
            team_name_placeholder: "Örn: Teknik Destek - Seviye 2",
            department: "Departman",
            select_department: "Departman seçin",
            desc_label: "Açıklama",
            desc_placeholder: "Ekibin görev tanımı...",
            auto_assign: "Otomatik Atama",
            auto_assign_desc: "Yeni ticketlar bu ekibe otomatik atanır.",
            assign_strategy: "Atama Stratejisi",
            round_robin: "Round Robin (Sıralı)",
            least_loaded: "Least Loaded (Yük Bazlı)",
            skill_based: "Skill Based (Yetenek Bazlı)",
            submit: "Ekibi Başlat",
            submitting: "Oluşturuluyor...",
            success: "Yeni ekip başarıyla oluşturuldu.",
            error_dept: "Lütfen bir departman seçin.",
            error_server: "Ekip oluşturulurken bir hata oluştu."
        },
        team_member_add: {
            title: "Yeni Ajan Ata",
            description: "Ekibe sistemde kayıtlı olan bir kullanıcıyı ajan olarak atayın.",
            select_agent: "Kullanıcı (Ajan)",
            select_agent_placeholder: "Bir kullanıcı seçin",
            loading_users: "Kullanıcılar yükleniyor...",
            no_users: "Atanabilecek yeni kullanıcı bulunamadı.",
            role: "Ekip İçi Rolü",
            select_role: "Rol seçin",
            role_desc: "Bu rol sadece bu ekip içindeki yetkilerini belirler.",
            cancel: "İptal",
            submit: "Ekibe Ata",
            submitting: "Ekleniyor...",
            success: "Ekibe yeni üye başarıyla eklendi.",
            error_select: "Lütfen bir ajan seçin.",
            error_server: "Üye eklenirken bir hata oluştu."
        }
    },
    en: {
        team_creation: {
            title: "Create New Team",
            description: "Define a new team to manage operational processes.",
            team_name: "Team Name",
            team_name_placeholder: "Ex: Technical Support - Level 2",
            department: "Department",
            select_department: "Select a department",
            desc_label: "Description",
            desc_placeholder: "Team's job description...",
            auto_assign: "Auto Assignment",
            auto_assign_desc: "New tickets are automatically assigned to this team.",
            assign_strategy: "Assignment Strategy",
            round_robin: "Round Robin (Sequential)",
            least_loaded: "Least Loaded (Load Based)",
            skill_based: "Skill Based (Ability Based)",
            submit: "Launch Team",
            submitting: "Creating...",
            success: "New team created successfully.",
            error_dept: "Please select a department.",
            error_server: "An error occurred while creating the team."
        },
        team_member_add: {
            title: "Assign New Agent",
            description: "Assign a registered user to the team as an agent.",
            select_agent: "User (Agent)",
            select_agent_placeholder: "Select a user",
            loading_users: "Loading users...",
            no_users: "No new users available to assign.",
            role: "In-Team Role",
            select_role: "Select role",
            role_desc: "This role only determines their permissions within this team.",
            cancel: "Cancel",
            submit: "Assign to Team",
            submitting: "Adding...",
            success: "New member successfully added to the team.",
            error_select: "Please select an agent.",
            error_server: "An error occurred while adding the member."
        }
    },
    de: {
        team_creation: {
            title: "Neues Team Erstellen",
            description: "Definieren Sie ein neues Team, um operative Prozesse zu verwalten.",
            team_name: "Teamname",
            team_name_placeholder: "Bsp: Technischer Support - Ebene 2",
            department: "Abteilung",
            select_department: "Wählen Sie eine Abteilung",
            desc_label: "Beschreibung",
            desc_placeholder: "Stellenbeschreibung des Teams...",
            auto_assign: "Automatische Zuweisung",
            auto_assign_desc: "Neue Tickets werden diesem Team automatisch zugewiesen.",
            assign_strategy: "Zuweisungsstrategie",
            round_robin: "Round Robin (Sequentiell)",
            least_loaded: "Am wenigsten belastet (Lastbasiert)",
            skill_based: "Fähigkeitsbasiert",
            submit: "Team Starten",
            submitting: "Wird erstellt...",
            success: "Neues Team erfolgreich erstellt.",
            error_dept: "Bitte wählen Sie eine Abteilung aus.",
            error_server: "Fehler beim Erstellen des Teams."
        },
        team_member_add: {
            title: "Neuen Agenten Zuweisen",
            description: "Weisen Sie dem Team einen registrierten Benutzer als Agenten zu.",
            select_agent: "Benutzer (Agent)",
            select_agent_placeholder: "Wählen Sie einen Benutzer",
            loading_users: "Benutzer werden geladen...",
            no_users: "Keine neuen Benutzer zur Zuweisung verfügbar.",
            role: "Role im Team",
            select_role: "Rolle wählen",
            role_desc: "Diese Rolle bestimmt nur ihre Berechtigungen innerhalb dieses Teams.",
            cancel: "Abbrechen",
            submit: "Dem Team Zuweisen",
            submitting: "Hinzufügen...",
            success: "Neues Mitglied erfolgreich zum Team hinzugefügt.",
            error_select: "Bitte wählen Sie einen Agenten aus.",
            error_server: "Fehler beim Hinzufügen des Mitglieds."
        }
    }
};

locales.forEach(locale => {
    const filePath = path.join(messagesDir, `${locale}.json`);
    let data = {};
    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    if (!data.teams) {
        data.teams = {};
    }

    data.teams.creation = newTranslations[locale].team_creation;
    data.teams.member_add = newTranslations[locale].team_member_add;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locale} translations for teams components.`);
});
