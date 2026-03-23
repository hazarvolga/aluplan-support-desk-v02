const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'apps/frontend/messages');

const data = {
    tr: {
        teams: {
            loading: {
                agent: "Profil verileri analiz ediliyor...",
                dept: "Departman verileri yükleniyor...",
                team: "Ekip verileri senkronize ediliyor..."
            },
            nav: {
                back_teams: "Ekiplere Dön",
                back: "Geri Dön"
            },
            actions: {
                edit_profile: "Profili Düzenle",
                edit_dept: "Departmanı Düzenle",
                add_skill: "Yeni Yetkinlik Ekle",
                add_sla: "Yeni SLA Politikası Ekle",
                add_member: "Yeni Üye Ekle",
                configure: "Yapılandır",
                add_agent: "Yeni Ajan Ekle",
                add_team: "Yeni Ekip",
                manage_team: "Takımı Yönet",
                details: "Detaylar",
                view_profile: "Profil",
                view_team: "TAKIMI GÖR",
                edit: "DÜZENLE"
            },
            tabs: {
                performance: "Performans",
                skills: "Yetkinlikler",
                schedule: "Çalışma Takvimi",
                overview: "Genel Bakış",
                sla_policies: "SLA Politikaları",
                departments: "Departmanlar",
                teams: "Ekipler",
                agents: "Ajanlar"
            },
            stats: {
                tickets: "Ticket İstatistikleri",
                last_30_days: "SON 30 GÜN",
                active_load: "Aktif İş Yükü",
                csat: "CSAT Skoru",
                avg_response: "Ort. Yanıt",
                monthly_quota: "Aylık Ticket Kotası",
                first_response_target: "İlk Yanıt SLA Hedefi",
                active_teams: "Aktif Ekipler",
                total_agents: "Toplam Ajan",
                avg_response_dept: "Ort. Yanıt Süresi",
                sla_compliance: "SLA Uyumu",
                active_ticket_load: "Aktif Ticket Yükü",
                quick_stats: "Hızlı İstatistikler",
                online_rate: "Online Oranı",
                pending_queue: "Bekleyen Kuyruk",
                resolved_today: "Bugün Çözülen",
                alerts: "Uyarılar",
                overload: "Fazla Yüklenme",
                sla_stable: "SLA Stabil"
            },
            labels: {
                badges: "Başarı Rozetleri",
                sla_master: "SLA Master",
                top_rated: "Top Rated",
                quick_resolve: "Hızlı Çözüm",
                targets: "Hedefler",
                technical_skills: "Teknik Yetkinlikler",
                skills_desc: "Ajanın uzmanlık alanları ve güven seviyeleri.",
                no_skills: "Henüz yetkinlik atanmamış.",
                leave: "İZİN",
                recent_activity: "Son Aktiviteler",
                critical_sla: "Kritik SLA Hedefleri",
                first_response: "İLK YANIT",
                resolution: "ÇÖZÜM",
                first_response_time: "İlk Yanıt",
                resolution_time: "Çözüm Süresi",
                sla_config: "SLA Yapılandırması",
                sla_config_desc: "Departman genelindeki hizmet seviyesi hedefleri.",
                automation_status: "OTOMASYON DURUMU",
                active: "AKTİF",
                passive: "PASİF",
                round_robin: "Round Robin",
                rr_desc: "Sıralı atama stratejisi uygulanıyor.",
                team_members: "Ekip Üyeleri",
                command_center: "Ekip Komuta Merkezi",
                organization: "Tek Organizasyon: Aluplan Destek Sistemi",
                auto_assignment: "OTO-ATAMA",
                strategy: "Strateji:",
                agent: "Ajan / Temsilci",
                status: "Durumu",
                role: "Rol",
                actions: "İşlemler"
            }
        }
    },
    en: {
        teams: {
            loading: {
                agent: "Analyzing profile data...",
                dept: "Loading department data...",
                team: "Synchronizing team data..."
            },
            nav: {
                back_teams: "Back to Teams",
                back: "Go Back"
            },
            actions: {
                edit_profile: "Edit Profile",
                edit_dept: "Edit Department",
                add_skill: "Add New Skill",
                add_sla: "Add New SLA Policy",
                add_member: "Add New Member",
                configure: "Configure",
                add_agent: "Add New Agent",
                add_team: "New Team",
                manage_team: "Manage Team",
                details: "Details",
                view_profile: "Profile",
                view_team: "VIEW TEAM",
                edit: "EDIT"
            },
            tabs: {
                performance: "Performance",
                skills: "Skills",
                schedule: "Work Schedule",
                overview: "Overview",
                sla_policies: "SLA Policies",
                departments: "Departments",
                teams: "Teams",
                agents: "Agents"
            },
            stats: {
                tickets: "Ticket Statistics",
                last_30_days: "LAST 30 DAYS",
                active_load: "Active Workload",
                csat: "CSAT Score",
                avg_response: "Avg. Response",
                monthly_quota: "Monthly Ticket Quota",
                first_response_target: "First Response SLA Target",
                active_teams: "Active Teams",
                total_agents: "Total Agents",
                avg_response_dept: "Avg. Response Time",
                sla_compliance: "SLA Compliance",
                active_ticket_load: "Active Ticket Load",
                quick_stats: "Quick Statistics",
                online_rate: "Online Rate",
                pending_queue: "Pending Queue",
                resolved_today: "Resolved Today",
                alerts: "Alerts",
                overload: "Overload",
                sla_stable: "SLA Stable"
            },
            labels: {
                badges: "Achievement Badges",
                sla_master: "SLA Master",
                top_rated: "Top Rated",
                quick_resolve: "Quick Resolve",
                targets: "Targets",
                technical_skills: "Technical Skills",
                skills_desc: "Agent's areas of expertise and confidence levels.",
                no_skills: "No skills assigned yet.",
                leave: "LEAVE",
                recent_activity: "Recent Activity",
                critical_sla: "Critical SLA Targets",
                first_response: "FIRST RESPONSE",
                resolution: "RESOLUTION",
                first_response_time: "First Response",
                resolution_time: "Resolution Time",
                sla_config: "SLA Configuration",
                sla_config_desc: "Service level targets across the department.",
                automation_status: "AUTOMATION STATUS",
                active: "ACTIVE",
                passive: "PASSIVE",
                round_robin: "Round Robin",
                rr_desc: "Sequential assignment strategy is applied.",
                team_members: "Team Members",
                command_center: "Team Command Center",
                organization: "Single Organization: Aluplan Support System",
                auto_assignment: "AUTO-ASSIGNMENT",
                strategy: "Strategy:",
                agent: "Agent / Rep",
                status: "Status",
                role: "Role",
                actions: "Actions"
            }
        }
    },
    de: {
        teams: {
            loading: {
                agent: "Profildaten werden analysiert...",
                dept: "Abteilungsdaten werden geladen...",
                team: "Teamdaten werden synchronisiert..."
            },
            nav: {
                back_teams: "Zurück zu Teams",
                back: "Zurück"
            },
            actions: {
                edit_profile: "Profil bearbeiten",
                edit_dept: "Abteilung bearbeiten",
                add_skill: "Neue Fähigkeit hinzufügen",
                add_sla: "Neue SLA-Richtlinie",
                add_member: "Neues Mitglied hinzufügen",
                configure: "Konfigurieren",
                add_agent: "Neuen Agenten hinzufügen",
                add_team: "Neues Team",
                manage_team: "Team verwalten",
                details: "Details",
                view_profile: "Profil",
                view_team: "TEAM ANSEHEN",
                edit: "BEARBEITEN"
            },
            tabs: {
                performance: "Leistung",
                skills: "Fähigkeiten",
                schedule: "Arbeitsplan",
                overview: "Übersicht",
                sla_policies: "SLA-Richtlinien",
                departments: "Abteilungen",
                teams: "Teams",
                agents: "Agenten"
            },
            stats: {
                tickets: "Ticket-Statistiken",
                last_30_days: "LETZTE 30 TAGE",
                active_load: "Aktive Arbeitsbelastung",
                csat: "CSAT-Score",
                avg_response: "Durchschnittliche Antwortzeit",
                monthly_quota: "Monatliches Ticketkontingent",
                first_response_target: "SLA-Ziel für erste Antwort",
                active_teams: "Aktive Teams",
                total_agents: "Agenten gesamt",
                avg_response_dept: "Durchschnittliche Antwortzeit",
                sla_compliance: "SLA-Einhaltung",
                active_ticket_load: "Aktive Ticketbelastung",
                quick_stats: "Schnelle Statistiken",
                online_rate: "Online-Rate",
                pending_queue: "Ausstehende Warteschlange",
                resolved_today: "Heute gelöst",
                alerts: "Warnungen",
                overload: "Überlastung",
                sla_stable: "SLA Stabil"
            },
            labels: {
                badges: "Erfolgsabzeichen",
                sla_master: "SLA-Meister",
                top_rated: "Bestbewertet",
                quick_resolve: "Schnelle Lösung",
                targets: "Ziele",
                technical_skills: "Technische Fähigkeiten",
                skills_desc: "Fachgebiete und Vertrauensniveau des Agenten.",
                no_skills: "Noch keine Fähigkeiten zugewiesen.",
                leave: "URLAUB",
                recent_activity: "Letzte Aktivitäten",
                critical_sla: "Kritische SLA-Ziele",
                first_response: "ERSTE ANTWORT",
                resolution: "LÖSUNG",
                first_response_time: "Erste Antwort",
                resolution_time: "Lösungszeit",
                sla_config: "SLA-Konfiguration",
                sla_config_desc: "Service-Level-Ziele der Abteilung.",
                automation_status: "AUTOMATISIERUNGSSTATUS",
                active: "AKTIV",
                passive: "PASSIV",
                round_robin: "Round Robin",
                rr_desc: "Sequenzielle Zuweisungsstrategie wird angewendet.",
                team_members: "Teammitglieder",
                command_center: "Team-Kommandozentrale",
                organization: "Eine Organisation: Aluplan Support",
                auto_assignment: "AUTO-ZUWEISUNG",
                strategy: "Strategie:",
                agent: "Agent / Vertreter",
                status: "Status",
                role: "Rolle",
                actions: "Aktionen"
            }
        }
    }
};

function deepMerge(target, source) {
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

['tr', 'en', 'de'].forEach(loc => {
    const filePath = path.join(basePath, `${loc}.json`);
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    deepMerge(fileContent, data[loc]);

    fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
    console.log(`Updated ${loc}.json`);
});
