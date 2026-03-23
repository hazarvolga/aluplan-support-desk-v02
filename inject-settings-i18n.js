const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'apps/frontend/messages');

const data = {
    tr: {
        settings: {
            ai: {
                base_url: "Base URL",
                base_url_optional: "Base URL (Opsiyonel)",
                api_key: "API Key",
                chat_model: "Chat Model",
                embed_model: "Embedding Model",
                unsupported: "Desteklenmiyor",
                embedding: "Embedding"
            },
            sla: {
                load_error: "SLA verileri yüklenemedi:"
            },
            toasts: {
                error_fallback: "Bilinmeyen hata"
            }
        },
        profile: {
            toasts: {
                unknown_error: "Bilinmeyen hata"
            }
        }
    },
    en: {
        settings: {
            ai: {
                base_url: "Base URL",
                base_url_optional: "Base URL (Optional)",
                api_key: "API Key",
                chat_model: "Chat Model",
                embed_model: "Embedding Model",
                unsupported: "Not Supported",
                embedding: "Embedding"
            },
            sla: {
                load_error: "Failed to load SLA data:"
            },
            toasts: {
                error_fallback: "Unknown error"
            }
        },
        profile: {
            toasts: {
                unknown_error: "Unknown error"
            }
        }
    },
    de: {
        settings: {
            ai: {
                base_url: "Basis-URL",
                base_url_optional: "Basis-URL (Optional)",
                api_key: "API-Schlüssel",
                chat_model: "Chat-Modell",
                embed_model: "Einbettungsmodell",
                unsupported: "Nicht unterstützt",
                embedding: "Einbettung"
            },
            sla: {
                load_error: "SLA-Daten konnten nicht geladen werden:"
            },
            toasts: {
                error_fallback: "Unbekannter Fehler"
            }
        },
        profile: {
            toasts: {
                unknown_error: "Unbekannter Fehler"
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
