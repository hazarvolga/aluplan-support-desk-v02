# Operation-Bazlı Yetkilendirme Matrisi

**Oluşturan:** Claude - **Codex düzeltmeleri:** 2026-08-06, 2026-08-07 - **Yöntem:** Proje controller dekoratör bloklarından çıkarılan 232 operation, OpenAPI ile çapraz doğrulandı; paket-kaynaklı `GET /metrics` eklenerek toplam 233 operation'a tamamlandı.

Sınıflar:
- **PUBLIC**: JWT muaf, ek koruma yok
- **PUBLIC+GUARD**: JWT muaf ama imza/state/refresh guard ile korunuyor
- **JWT_ONLY**: Kimlik doğrulanmış her kullanıcı (CUSTOMER dahil) erişebilir
- **ROLE**: @Roles ile sınırlı
- **PERMISSION**: @RequirePermissions ile sınırlı
- **ROLE+PERMISSION**: İkisi birden gerekli

> Doğrulama notu: Sınıf-seviyesi dekoratörler birden fazla route etkileyebilir; bu yüzden operation sayısı (bu dosyada 233) ham dekoratör sayısıyla birebir eşleşmez. `Guard` sütunu aksi belirtilmedikçe controller/class/method üzerinde açıkça tanımlanmış guard'ları gösterir; global `APP_GUARD` kayıtları her satırda tekrarlanmaz.

## external/@willsoto/nestjs-prometheus

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /metrics | JWT_ONLY | - | - | Global JwtAuthGuard (APP_GUARD) |

## ai/ai-interaction-history.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /ai/interactions | PERMISSION | - | ai-interactions:read | JwtAuthGuard,RbacGuard,ThrottlerGuard |

## ai/ai.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /ai/test-storage | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| POST /ai/query | JWT_ONLY | - | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/status/:jobId | JWT_ONLY | - | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/metrics | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/health-metrics | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/intelligence | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/health-trends | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/knowledge-gaps | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| POST /ai/trigger-report | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/sources-stats | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| POST /ai/translate | ROLE | ADMIN, SUPERUSER, AGENT | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/query/stream | JWT_ONLY | - | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| POST /ai/interactions/:id/feedback | JWT_ONLY | - | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| POST /ai/interactions/:id/telemetry | JWT_ONLY | - | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/review-queue | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| POST /ai/reindex | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/status | JWT_ONLY | - | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/health-status | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/embedding/migration-status | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/cleanup/pre-reimport-inspect | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| POST /ai/test-connection | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| POST /ai/list-models | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| POST /ai/search | JWT_ONLY | - | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/tickets/:id/summarize | ROLE | ADMIN, AGENT, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/copilot/draft/:ticketId | ROLE | ADMIN, AGENT, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/health-events | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |
| GET /ai/health-stats | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard,ThrottlerGuard |

## announcement-templates/announcement-templates.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /announcement-templates | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| GET /announcement-templates | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| GET /announcement-templates/:id | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| PATCH /announcement-templates/:id | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| DELETE /announcement-templates/:id | ROLE | admin | - | JwtAuthGuard,RbacGuard |

## announcements/announcements.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /announcements | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| GET /announcements/filters | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| GET /announcements | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| GET /announcements/admin/:id | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| PATCH /announcements/:id | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| DELETE /announcements/:id | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| POST /announcements/target-count | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| POST /announcements/:id/broadcast | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| GET /announcements/my | ROLE | ADMIN, AGENT, CUSTOMER | - | JwtAuthGuard,RbacGuard |
| GET /announcements/my/unread-count | ROLE | ADMIN, AGENT, CUSTOMER | - | JwtAuthGuard,RbacGuard |
| PATCH /announcements/logs/:logId/read | ROLE | ADMIN, AGENT, CUSTOMER | - | JwtAuthGuard,RbacGuard |
| GET /announcements/:id | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |

## attachments/attachments.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /attachments/upload/:messageId | PERMISSION | - | ticket:update | RbacGuard |
| GET /attachments/:id/download | PERMISSION | - | ticket:read | RbacGuard |

## auth/auth.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /auth/login | PUBLIC | - | - | - |
| POST /auth/refresh | PUBLIC+GUARD | - | - | RefreshGuard |
| POST /auth/logout | JWT_ONLY | - | - | JwtAuthGuard |
| POST /auth/admin/force-logout | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| POST /auth/lookup | PUBLIC | - | - | - |
| POST /auth/forgot-password | PUBLIC | - | - | - |
| POST /auth/resend-verification | PUBLIC | - | - | - |
| POST /auth/reset-password | PUBLIC | - | - | - |
| GET /auth/me | JWT_ONLY | - | - | JwtAuthGuard |
| POST /auth/verify-email | PUBLIC | - | - | - |
| GET /auth/test-email-config | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| GET /auth/system-requirements | PUBLIC | - | - | - |

## branding/branding.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /branding/assets/*path | PUBLIC | - | - | - |
| POST /branding/upload-logo | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard |

## common/controllers/storage.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /storage/*path | PUBLIC | - | - | - |

## crm/crm.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /crm/connections | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| POST /crm/connections | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| POST /crm/verify-connection/:id | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| POST /crm/sync/:id | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| GET /crm/logs/:connectionId | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| POST /crm/delta-sync/:id | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| GET /crm/changes | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| GET /crm/fields-definitions | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| GET /crm/discovery/:id | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| GET /crm/accounts | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| GET /crm/accounts/:id | ROLE | admin | - | JwtAuthGuard,RbacGuard |
| POST /crm/accounts/bulk-delete | ROLE | admin | - | JwtAuthGuard,RbacGuard |

## crm/webhooks/crm-webhook.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /crm/webhooks/dynamics365 | PUBLIC+GUARD | - | - | CrmWebhookGuard |

## customers/customers.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /customers/register | PUBLIC | - | - | - |
| GET /customers | ROLE | ADMIN, SUPPORT_AGENT, SUPPORT_MANAGER | - | JwtAuthGuard,RbacGuard |
| POST /customers/import | ROLE | ADMIN, SUPPORT_MANAGER | - | JwtAuthGuard,RbacGuard |
| POST /customers/me/hotinfo | JWT_ONLY | - | - | JwtAuthGuard |
| GET /customers/:id | ROLE | admin, support_agent, support_manager | - | JwtAuthGuard,RbacGuard |
| PATCH /customers/:id | ROLE | admin, support_manager | - | JwtAuthGuard,RbacGuard |
| POST /customers/bulk-delete | ROLE | admin, support_manager | - | JwtAuthGuard,RbacGuard |
| POST /customers/:id/reset-password | ROLE | admin, support_manager | - | JwtAuthGuard,RbacGuard |
| GET /customers/:id/hotinfo/download | ROLE | admin, support_agent, support_manager | - | JwtAuthGuard,RbacGuard |

## email-validator/email-validator.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /email-validator/verify | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |
| POST /email-validator/verify-bulk | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |

## email/email.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /email/admin/imap/verify | PERMISSION | - | settings:read | JwtAuthGuard,RbacGuard |
| GET /email/track/:logId | PUBLIC | - | - | - |
| POST /email/webhook/resend | PUBLIC | - | - | - |
| GET /email/preferences | JWT_ONLY | - | - | JwtAuthGuard |
| POST /email/preferences | JWT_ONLY | - | - | JwtAuthGuard |
| POST /email/unsubscribe | PUBLIC | - | - | - |
| GET /email/admin/logs | PERMISSION | - | settings:read | JwtAuthGuard,RbacGuard |
| GET /email/admin/templates | PERMISSION | - | settings:read | JwtAuthGuard,RbacGuard |
| GET /email/admin/templates/:name/source | PERMISSION | - | settings:read | JwtAuthGuard,RbacGuard |
| POST /email/admin/templates/:name/save | PERMISSION | - | settings:write | JwtAuthGuard,RbacGuard |
| POST /email/admin/templates/:name/preview | PERMISSION | - | settings:read | JwtAuthGuard,RbacGuard |
| POST /email/admin/provider/verify | PERMISSION | - | settings:read | JwtAuthGuard,RbacGuard |
| GET /email/gmail/auth-url | PERMISSION | - | settings:write | JwtAuthGuard,RbacGuard |
| GET /email/gmail/callback | PUBLIC | - | - | - |

## email/preferences.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /preferences/email | JWT_ONLY | - | - | JwtAuthGuard |
| PATCH /preferences/email | JWT_ONLY | - | - | JwtAuthGuard |

## faq/faq.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /faq/published | JWT_ONLY | - | - | RbacGuard |
| GET /faq | PERMISSION | - | faq:review | RbacGuard |
| GET /faq/:id | PERMISSION | - | faq:review | RbacGuard |
| PATCH /faq/:id | PERMISSION | - | faq:manage | RbacGuard |
| POST /faq/:id/approve | ROLE | admin, support_manager, kb_editor, support_agent | - | RbacGuard |
| POST /faq/:id/dismiss | ROLE | admin, support_manager, kb_editor, support_agent | - | RbacGuard |
| DELETE /faq/:id | ROLE | admin | - | RbacGuard |
| POST /faq/pipeline/run | ROLE | admin, support_manager | - | RbacGuard |

## health/health.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /health | PUBLIC | - | - | - |
| POST /health/backup | ROLE | ADMIN | - | JwtAuthGuard,RbacGuard |

## knowledge-base/knowledge-base-approval.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /kb/articles/:id/submit | PERMISSION | - | kb:submit_review | RbacGuard |
| POST /kb/articles/:id/review | PERMISSION | - | kb:approve | RbacGuard |

## knowledge-base/knowledge-base.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /kb/categories | PERMISSION | - | kb:read | RbacGuard |
| POST /kb/categories | PERMISSION | - | kb:create | RbacGuard |
| GET /kb/articles | PERMISSION | - | kb:read | RbacGuard |
| GET /kb/articles/:id | PERMISSION | - | kb:read | RbacGuard |
| POST /kb/articles | PERMISSION | - | kb:create | RbacGuard |
| PATCH /kb/articles/:id | PERMISSION | - | kb:update | RbacGuard |
| PATCH /kb/articles/:id/archive | PERMISSION | - | kb:delete | RbacGuard |
| DELETE /kb/articles/:id | PERMISSION | - | kb:delete | RbacGuard |
| GET /kb/search | PERMISSION | - | kb:read | RbacGuard |
| POST /kb/articles/:id/view | PUBLIC | - | - | RbacGuard (RBAC metadata yok; `canActivate()` izin verir) |
| POST /kb/articles/:id/feedback | JWT_ONLY | - | - | RbacGuard |
| GET /kb/articles/:id/analytics | PERMISSION | - | reports:read | RbacGuard |
| GET /kb/articles/:id/compare | PERMISSION | - | kb:read | RbacGuard |
| POST /kb/articles/suggest-category | PERMISSION | - | kb:create | RbacGuard |
| GET /kb/analytics | PERMISSION | - | reports:read | RbacGuard |

## knowledge-pool/knowledge-pool.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /knowledge-pool/sources | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/sources/upload | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| GET /knowledge-pool/sources | ROLE | admin, super-admin, agent | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/crawl/learnnow/discover | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/crawl/discover | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/crawl/allplan-help/discover | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| GET /knowledge-pool/crawl/candidates | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/crawl/candidates/:id/import | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/crawl/candidates/bulk-delete | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| DELETE /knowledge-pool/crawl/candidates/:id | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/sources/bulk-delete | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| DELETE /knowledge-pool/sources/:id | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/sources/:id/sync | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| GET /knowledge-pool/sources/:id/logs | ROLE | admin, super-admin, manager, support-manager, agent | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/sync-dataset | ROLE | admin, super-admin, manager, support-manager | - | JwtAuthGuard,RbacGuard |
| POST /knowledge-pool/sync-external | ROLE | admin, super-admin | - | JwtAuthGuard,RbacGuard |

## macros/macros.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /macros | ROLE | ADMIN, SUPERUSER, AGENT | - | JwtAuthGuard,RbacGuard |
| GET /macros | ROLE | ADMIN, SUPERUSER, AGENT | - | JwtAuthGuard,RbacGuard |
| GET /macros/:id | ROLE | ADMIN, SUPERUSER, AGENT | - | JwtAuthGuard,RbacGuard |
| GET /macros/:id/render | ROLE | ADMIN, SUPERUSER, AGENT | - | JwtAuthGuard,RbacGuard |
| PATCH /macros/:id | ROLE | ADMIN, SUPERUSER, AGENT | - | JwtAuthGuard,RbacGuard |
| DELETE /macros/:id | ROLE | ADMIN, SUPERUSER, AGENT | - | JwtAuthGuard,RbacGuard |

## notifications/notifications.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /notifications | JWT_ONLY | - | - | JwtAuthGuard |
| PATCH /notifications/:id/read | JWT_ONLY | - | - | JwtAuthGuard |
| PATCH /notifications/read-all | JWT_ONLY | - | - | JwtAuthGuard |

## omni-channel/omni-channel.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /omni-channel/webhook/email | PUBLIC+GUARD | - | - | InboundEmailWebhookSignatureGuard |

## ops-dashboard/ops-dashboard.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /dashboard/ops | ROLE | ADMIN, SUPERUSER, DEPARTMENT_MANAGER, TEAM_LEAD, SENIOR_AGENT, AGENT | - | RbacGuard |

## review-center/review-center.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /review-center/summary | JWT_ONLY | - | - | Global JwtAuthGuard (APP_GUARD); yanıt içerikleri servis katmanında rol/izin kapsamına göre süzülür |

## proactive-chat/proactive-chat.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /proactive-chat/sessions | ROLE | admin, super-admin, department-manager, team-lead, agent | - | RbacGuard |
| PATCH /proactive-chat/sessions/:id/accept | ROLE | admin, super-admin, department-manager, team-lead, agent, customer | - | RbacGuard |
| PATCH /proactive-chat/sessions/:id/decline | ROLE | admin, super-admin, department-manager, team-lead, agent, customer | - | RbacGuard |
| PATCH /proactive-chat/sessions/:id/end | ROLE | admin, super-admin, department-manager, team-lead, agent, customer | - | RbacGuard |
| POST /proactive-chat/sessions/:id/messages | ROLE | admin, super-admin, department-manager, team-lead, agent, customer | - | RbacGuard |
| GET /proactive-chat/sessions/:id/messages | ROLE | admin, super-admin, department-manager, team-lead, agent, customer | - | RbacGuard |
| POST /proactive-chat/sessions/:id/convert | ROLE | admin, super-admin, department-manager, team-lead, agent | - | RbacGuard |
| GET /proactive-chat/sessions | JWT_ONLY | - | - | RbacGuard |

## products/products.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /products | PUBLIC | - | - | - |
| POST /products | ROLE | admin, support_manager | - | JwtAuthGuard,RbacGuard |
| GET /products/:id | JWT_ONLY | - | - | JwtAuthGuard |
| PATCH /products/:id | ROLE | admin, support_manager | - | JwtAuthGuard,RbacGuard |
| DELETE /products/:id | ROLE | admin, support_manager | - | JwtAuthGuard,RbacGuard |
| POST /products/:id/categories | ROLE | admin, support_manager | - | JwtAuthGuard,RbacGuard |
| PATCH /products/categories/:categoryId | ROLE | admin, support_manager | - | JwtAuthGuard,RbacGuard |
| DELETE /products/categories/:categoryId | ROLE | admin, support_manager | - | JwtAuthGuard,RbacGuard |
| POST /products/internal/restore-faqs | ROLE | admin | - | JwtAuthGuard,RbacGuard |

## reports/reports.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /reports/sla-performance | ROLE | admin, support_manager | - | RbacGuard,ThrottlerGuard |
| GET /reports/agent-performance | ROLE | admin, support_manager | - | RbacGuard,ThrottlerGuard |

## settings/settings.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /settings | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard |
| POST /settings/bulk | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard |
| POST /settings/test-storage | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard |
| GET /settings | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard |
| GET /settings/:key | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard |
| DELETE /settings/:key | ROLE | ADMIN, SUPERUSER | - | JwtAuthGuard,RbacGuard |

## teams/teams.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /teams/departments | ROLE | ADMIN, DEPARTMENT_MANAGER | - | RbacGuard |
| GET /teams/departments/options | ROLE | ADMIN, DEPARTMENT_MANAGER, SUPPORT_AGENT, SUPPORT_MANAGER, CUSTOMER | - | RbacGuard |
| GET /teams/departments/:id | ROLE | ADMIN, DEPARTMENT_MANAGER | - | RbacGuard |
| GET /teams | ROLE | ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD, AGENT | - | RbacGuard |
| POST /teams | ROLE | ADMIN, DEPARTMENT_MANAGER | - | RbacGuard |
| GET /teams/agents/:id | ROLE | ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD, AGENT | - | RbacGuard |
| PATCH /teams/agents/me/status | JWT_ONLY | - | - | RbacGuard |
| PATCH /teams/agents/me/profile | JWT_ONLY | - | - | RbacGuard |
| GET /teams/skills | JWT_ONLY | - | - | RbacGuard |
| GET /teams/:id | ROLE | ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD, AGENT | - | RbacGuard |
| PATCH /teams/:id | ROLE | ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD | - | RbacGuard |
| GET /teams/:id/stats | ROLE | ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD, AGENT | - | RbacGuard |
| POST /teams/:id/members | ROLE | ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD | - | RbacGuard |
| DELETE /teams/:id/members/:userId | ROLE | ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD | - | RbacGuard |

## tickets/sla.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /tickets/sla/policies | PERMISSION | - | admin:settings | RbacGuard |
| POST /tickets/sla/policies | PERMISSION | - | admin:settings | RbacGuard |
| PATCH /tickets/sla/policies/:id | PERMISSION | - | admin:settings | RbacGuard |
| DELETE /tickets/sla/policies/:id | PERMISSION | - | admin:settings | RbacGuard |

## tickets/tickets.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /tickets | PERMISSION | - | ticket:create | RbacGuard |
| GET /tickets | PERMISSION | - | ticket:read | RbacGuard |
| GET /tickets/sla/stats | PERMISSION | - | ticket:read | RbacGuard |
| GET /tickets/by-number/:number | PERMISSION | - | ticket:read | RbacGuard |
| GET /tickets/:id/ai-trace | PERMISSION | - | ticket:read | RbacGuard |
| GET /tickets/:id/assignable-agents | PERMISSION | - | ticket:assign | RbacGuard |
| GET /tickets/:id | PERMISSION | - | ticket:read | RbacGuard |
| PATCH /tickets/bulk | PERMISSION | - | ticket:update | RbacGuard |
| PATCH /tickets/:id | PERMISSION | - | ticket:update | RbacGuard |
| PATCH /tickets/:id/status/:status | PERMISSION | - | ticket:update | RbacGuard |
| PATCH /tickets/:id/assign/:userId | PERMISSION | - | ticket:assign | RbacGuard |
| POST /tickets/:id/escalate | PERMISSION | - | ticket:escalate | RbacGuard |
| POST /tickets/:id/link/:parentId | PERMISSION | - | ticket:update | RbacGuard |
| PATCH /tickets/:id/close | PERMISSION | - | ticket:close | RbacGuard |
| POST /tickets/:id/feedback | PERMISSION | - | ticket:read | RbacGuard |
| POST /tickets/:id/messages | PERMISSION | - | ticket:update | RbacGuard |
| DELETE /tickets/bulk | ROLE | ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD, SENIOR_AGENT | - | RbacGuard |
| DELETE /tickets/:id | ROLE | ADMIN, DEPARTMENT_MANAGER, TEAM_LEAD, SENIOR_AGENT | - | RbacGuard |

## users/users.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /users | ROLE | admin, support_manager | - | RbacGuard |
| GET /users/lookup | ROLE | admin | - | RbacGuard |
| GET /users/:id | JWT_ONLY | - | - | RbacGuard |
| POST /users | ROLE | admin | - | RbacGuard |
| PATCH /users/profile | JWT_ONLY | - | - | RbacGuard |
| PATCH /users/:id | ROLE | admin | - | RbacGuard |
| DELETE /users/:id | ROLE | admin | - | RbacGuard |

## webhooks/webhooks.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| POST /webhooks | ROLE | admin, superuser | - | JwtAuthGuard,RbacGuard |
| GET /webhooks | ROLE | admin, superuser | - | JwtAuthGuard,RbacGuard |
| GET /webhooks/:id | ROLE | admin, superuser | - | JwtAuthGuard,RbacGuard |
| PUT /webhooks/:id | ROLE | admin, superuser | - | JwtAuthGuard,RbacGuard |
| DELETE /webhooks/:id | ROLE | admin, superuser | - | JwtAuthGuard,RbacGuard |

## whatsapp/whatsapp.controller.ts

| Route | Sinif | Roller | Izinler | Guard |
|---|---|---|---|---|
| GET /whatsapp/webhook | PUBLIC | - | - | - |
| POST /whatsapp/webhook | PUBLIC+GUARD | - | - | WhatsAppWebhookSignatureGuard |
