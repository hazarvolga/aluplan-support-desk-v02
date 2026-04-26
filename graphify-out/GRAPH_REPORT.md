# Graph Report - aluplan-support-desk-V02  (2026-04-26)

## Corpus Check
- 593 files · ~1,180,435 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2250 nodes · 3635 edges · 109 communities detected
- Extraction: 62% EXTRACTED · 38% INFERRED · 0% AMBIGUOUS · INFERRED: 1385 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 119|Community 119]]
- [[_COMMUNITY_Community 122|Community 122]]
- [[_COMMUNITY_Community 123|Community 123]]
- [[_COMMUNITY_Community 125|Community 125]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 127|Community 127]]
- [[_COMMUNITY_Community 128|Community 128]]
- [[_COMMUNITY_Community 131|Community 131]]
- [[_COMMUNITY_Community 132|Community 132]]
- [[_COMMUNITY_Community 133|Community 133]]
- [[_COMMUNITY_Community 134|Community 134]]
- [[_COMMUNITY_Community 135|Community 135]]
- [[_COMMUNITY_Community 136|Community 136]]
- [[_COMMUNITY_Community 137|Community 137]]
- [[_COMMUNITY_Community 138|Community 138]]
- [[_COMMUNITY_Community 139|Community 139]]
- [[_COMMUNITY_Community 140|Community 140]]
- [[_COMMUNITY_Community 141|Community 141]]
- [[_COMMUNITY_Community 142|Community 142]]
- [[_COMMUNITY_Community 143|Community 143]]
- [[_COMMUNITY_Community 144|Community 144]]
- [[_COMMUNITY_Community 145|Community 145]]
- [[_COMMUNITY_Community 147|Community 147]]
- [[_COMMUNITY_Community 148|Community 148]]
- [[_COMMUNITY_Community 149|Community 149]]
- [[_COMMUNITY_Community 150|Community 150]]

## God Nodes (most connected - your core abstractions)
1. `Error()` - 210 edges
2. `t()` - 83 edges
3. `toast()` - 37 edges
4. `AiService` - 33 edges
5. `AiQueryService` - 31 edges
6. `load()` - 27 edges
7. `EmailService` - 25 edges
8. `AiController` - 24 edges
9. `GenericOpenAiService` - 20 edges
10. `TicketsService` - 19 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --calls--> `Error()`  [INFERRED]
  test-ws-locally.ts → apps/frontend/src/app/[locale]/error.tsx
- `bootstrap()` --calls--> `Error()`  [INFERRED]
  scripts/re-sync-knowledge.ts → apps/frontend/src/app/[locale]/error.tsx
- `main()` --calls--> `load()`  [INFERRED]
  scripts/syllabus_injector.py → apps/frontend/src/app/[locale]/(dashboard)/knowledge-base/analytics/page.tsx
- `main()` --calls--> `Error()`  [INFERRED]
  scripts/seed-production-pg.js → apps/frontend/src/app/[locale]/error.tsx
- `load_existing_qa()` --calls--> `load()`  [INFERRED]
  scripts/notebooklm-harvester.py → apps/frontend/src/app/[locale]/(dashboard)/knowledge-base/analytics/page.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.02
Nodes (131): AgentStatusBadge(), handleSave(), handleTest(), loadData(), apiGet(), apiPatch(), apiPost(), broadcastAnnouncementViaApi() (+123 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (57): AiAutoResolverService, AuditService, loginAsAdmin(), BusinessHoursService, main(), check(), check(), main() (+49 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (14): AiCopilotService, AiDiagnosisService, AiQueryService, callNormalize(), callNormalize(), AnnouncementTemplatesController, DocumentParserService, LangfuseService (+6 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (23): apiFetch(), bulkDeleteTickets(), bulkUpdateTickets(), createArticle(), createTicket(), deleteArticle(), deleteTicket(), getAuthHeaders() (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.03
Nodes (20): AiSemanticCache, EmbeddingNormalizer, bootstrap(), checkConnection(), MetricsService, middleware(), NotificationsGateway, categorize() (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (23): buildModule(), buildModule(), makeAiService(), makeConfig(), makeEmbeddingService(), makeLangfuse(), makePrisma(), makePromptContext() (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (7): AiService, EmailProcessor, GenericOpenAiService, mapPartsToOpenAi(), SmtpProvider, WhatsAppController, WhatsAppService

### Community 7 - "Community 7"
Cohesion: 0.04
Nodes (7): AutomationService, CustomersController, CustomersService, EmailService, ErrorLoggerService, GlobalExceptionFilter, HotinfoParserService

### Community 8 - "Community 8"
Cohesion: 0.04
Nodes (10): AuthController, AuthService, bootstrap(), KnowledgeBaseController, KnowledgeBaseService, makeSlug(), handleCompare(), handleFeedback() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (19): AutoAssignmentService, encrypt(), main(), main(), main(), fixImportedCustomers(), run(), grantAdmin() (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.04
Nodes (10): CrmController, CrmProcessor, buildSyncDetails(), CrmService, CrmWebhookController, CrmWebhookGuard, CryptoService, Dynamics365Adapter (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.04
Nodes (11): CrawlService, KnowledgePoolController, KnowledgePoolService, QueueMonitorService, bootstrap(), bootstrap(), bootstrap(), bootstrap() (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (32): a(), B(), c(), D(), g(), i(), k(), o() (+24 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (12): AiQueryProcessor, fetchPage(), handleItemClick(), sanitizeHtml(), AnnouncementsController, AnnouncementsService, buildEmailMock(), buildGatewayMock() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.08
Nodes (6): EmbeddingService, KbSummarizerProcessor, testLLMAPI(), OpenAiService, handleSuggest(), TicketClusteringService

### Community 15 - "Community 15"
Cohesion: 0.05
Nodes (12): main(), OmniChannelController, OmniChannelService, PreferencesController, main(), main(), main(), main() (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.06
Nodes (11): AiController, AiQueryDto, AiTelemetryDto, FeedbackDto, AiReportingService, loadMetrics(), handleTestStorage(), loadMetrics() (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.07
Nodes (4): AnnouncementTemplatesService, SettingsController, SettingsService, SsrfGuard

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (9): AttachmentsController, AttachmentsService, goToNext(), goToPrevious(), makeCurrent(), toggleClass(), DatabaseBackupService, HealthController (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.09
Nodes (30): getApiUrl(), processQueue(), request(), ask_notebooklm(), deep_discover(), discover(), ensure_dirs(), gap_analysis() (+22 more)

### Community 20 - "Community 20"
Cohesion: 0.08
Nodes (3): FaqController, FaqCronService, FaqService

### Community 21 - "Community 21"
Cohesion: 0.07
Nodes (7): fetchAgent(), fetchDept(), fetchTeam(), handleRemoveMember(), fetchUsers(), handleSubmit(), TeamsController

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (3): StorageController, UsersController, UsersService

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (4): DnsValidator, EmailValidatorController, EmailValidatorService, SyntaxValidator

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (8): AiQueryExecutedEvent, TicketAssignedEvent, TicketCreatedEvent, TicketMessageAddedEvent, TicketResolvedEvent, TicketStatusChangedEvent, UserLoggedInEvent, UserLoggedOutEvent

### Community 25 - "Community 25"
Cohesion: 0.36
Nodes (13): addSearchBox(), addSortIndicators(), enableUI(), getNthColumn(), getTable(), getTableBody(), getTableHeader(), loadColumns() (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.2
Nodes (2): BasePage, LoginPage

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (4): KnowledgeBasePage(), RoleGuard(), useAuth(), TicketsClient()

### Community 28 - "Community 28"
Cohesion: 0.39
Nodes (8): buildD365Account(), buildD365AccountPage1(), buildD365AccountPage2(), buildD365AccountsResponse(), buildD365Contact(), buildD365ContactPage1(), buildD365ContactPage2(), buildD365ContactsResponse()

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (1): MacrosController

### Community 30 - "Community 30"
Cohesion: 0.25
Nodes (1): MacrosService

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (1): RolesService

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (1): CustomerAnnouncementsController

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (1): AuditLogInterceptor

### Community 35 - "Community 35"
Cohesion: 0.53
Nodes (4): fileDataPartArbitrary(), inlineDataPartArbitrary(), textPartArbitrary(), validAiPartArbitrary()

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (1): NotificationsController

### Community 37 - "Community 37"
Cohesion: 0.4
Nodes (4): AnyNull, DbNull, JsonNull, PrismaClient

### Community 38 - "Community 38"
Cohesion: 0.4
Nodes (1): KnowledgeBaseApprovalController

### Community 39 - "Community 39"
Cohesion: 0.4
Nodes (4): CreateArticleDto, ReviewArticleDto, SubmitFeedbackDto, UpdateArticleDto

### Community 40 - "Community 40"
Cohesion: 0.6
Nodes (1): TrustScoreCalculator

### Community 41 - "Community 41"
Cohesion: 0.4
Nodes (1): ReportsService

### Community 42 - "Community 42"
Cohesion: 0.4
Nodes (1): ReportsController

### Community 43 - "Community 43"
Cohesion: 0.5
Nodes (1): DashboardPage

### Community 44 - "Community 44"
Cohesion: 0.5
Nodes (2): RootLayout(), NotFound()

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (1): RbacGuard

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (1): JwtAuthGuard

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (3): CreateAnnouncementDto, TargetCriteriaDto, UpdateAnnouncementDto

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (1): MetricsInterceptor

### Community 51 - "Community 51"
Cohesion: 0.5
Nodes (1): TeamScopeGuard

### Community 52 - "Community 52"
Cohesion: 0.5
Nodes (1): TicketOwnerGuard

### Community 54 - "Community 54"
Cohesion: 0.67
Nodes (1): getKeys()

### Community 60 - "Community 60"
Cohesion: 0.67
Nodes (1): TestController

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (2): CreateAnnouncementTemplateDto, UpdateAnnouncementTemplateDto

### Community 63 - "Community 63"
Cohesion: 0.67
Nodes (1): SentryExceptionFilter

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (2): buildAiQueryWorkerConfig(), buildQueueLimiterConfig()

### Community 65 - "Community 65"
Cohesion: 0.67
Nodes (1): SmtpValidator

### Community 89 - "Community 89"
Cohesion: 1.0
Nodes (1): AppModule

### Community 90 - "Community 90"
Cohesion: 1.0
Nodes (1): CustomersModule

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (1): UpdateCustomerProfileDto

### Community 92 - "Community 92"
Cohesion: 1.0
Nodes (1): ImportCustomerRecordDto

### Community 93 - "Community 93"
Cohesion: 1.0
Nodes (1): RegisterCustomerDto

### Community 94 - "Community 94"
Cohesion: 1.0
Nodes (1): MetricsModule

### Community 95 - "Community 95"
Cohesion: 1.0
Nodes (1): SettingsModule

### Community 96 - "Community 96"
Cohesion: 1.0
Nodes (1): BulkUpsertSettingDto

### Community 97 - "Community 97"
Cohesion: 1.0
Nodes (1): UpsertSettingDto

### Community 98 - "Community 98"
Cohesion: 1.0
Nodes (1): RbacModule

### Community 99 - "Community 99"
Cohesion: 1.0
Nodes (1): TicketsModule

### Community 100 - "Community 100"
Cohesion: 1.0
Nodes (1): UpdateSlaPolicyDto

### Community 101 - "Community 101"
Cohesion: 1.0
Nodes (1): CreateTicketDto

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (1): AddMessageDto

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (1): UpdateTicketDto

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (1): BulkUpdateTicketDto

### Community 105 - "Community 105"
Cohesion: 1.0
Nodes (1): EscalateTicketDto

### Community 106 - "Community 106"
Cohesion: 1.0
Nodes (1): CreateSlaPolicyDto

### Community 107 - "Community 107"
Cohesion: 1.0
Nodes (1): BrandingModule

### Community 108 - "Community 108"
Cohesion: 1.0
Nodes (1): ProductsModule

### Community 110 - "Community 110"
Cohesion: 1.0
Nodes (1): RedisModule

### Community 111 - "Community 111"
Cohesion: 1.0
Nodes (1): AuthModule

### Community 112 - "Community 112"
Cohesion: 1.0
Nodes (1): LoginDto

### Community 114 - "Community 114"
Cohesion: 1.0
Nodes (1): RefreshGuard

### Community 116 - "Community 116"
Cohesion: 1.0
Nodes (1): FaqModule

### Community 117 - "Community 117"
Cohesion: 1.0
Nodes (1): HealthModule

### Community 118 - "Community 118"
Cohesion: 1.0
Nodes (1): AnnouncementTemplatesModule

### Community 119 - "Community 119"
Cohesion: 1.0
Nodes (1): CrmModule

### Community 122 - "Community 122"
Cohesion: 1.0
Nodes (1): PrismaModule

### Community 123 - "Community 123"
Cohesion: 1.0
Nodes (1): AnnouncementsModule

### Community 125 - "Community 125"
Cohesion: 1.0
Nodes (1): MacrosModule

### Community 126 - "Community 126"
Cohesion: 1.0
Nodes (1): UpdateMacroDto

### Community 127 - "Community 127"
Cohesion: 1.0
Nodes (1): CreateMacroDto

### Community 128 - "Community 128"
Cohesion: 1.0
Nodes (1): CommonModule

### Community 131 - "Community 131"
Cohesion: 1.0
Nodes (1): KnowledgeBaseModule

### Community 132 - "Community 132"
Cohesion: 1.0
Nodes (1): AiModule

### Community 133 - "Community 133"
Cohesion: 1.0
Nodes (1): UsersModule

### Community 134 - "Community 134"
Cohesion: 1.0
Nodes (1): UpdateUserDto

### Community 135 - "Community 135"
Cohesion: 1.0
Nodes (1): UpdateProfileDto

### Community 136 - "Community 136"
Cohesion: 1.0
Nodes (1): CreateUserDto

### Community 137 - "Community 137"
Cohesion: 1.0
Nodes (1): OmniChannelModule

### Community 138 - "Community 138"
Cohesion: 1.0
Nodes (1): TeamsModule

### Community 139 - "Community 139"
Cohesion: 1.0
Nodes (1): KnowledgePoolModule

### Community 140 - "Community 140"
Cohesion: 1.0
Nodes (1): CreateKnowledgeSourceDto

### Community 141 - "Community 141"
Cohesion: 1.0
Nodes (1): AutomationModule

### Community 142 - "Community 142"
Cohesion: 1.0
Nodes (1): EmailValidatorModule

### Community 143 - "Community 143"
Cohesion: 1.0
Nodes (1): AttachmentsModule

### Community 144 - "Community 144"
Cohesion: 1.0
Nodes (1): WebhooksModule

### Community 145 - "Community 145"
Cohesion: 1.0
Nodes (1): NotificationsModule

### Community 147 - "Community 147"
Cohesion: 1.0
Nodes (1): EmailModule

### Community 148 - "Community 148"
Cohesion: 1.0
Nodes (1): UpdateEmailPreferenceDto

### Community 149 - "Community 149"
Cohesion: 1.0
Nodes (1): WhatsAppModule

### Community 150 - "Community 150"
Cohesion: 1.0
Nodes (1): ReportsModule

## Knowledge Gaps
- **85 isolated node(s):** `Ensure output directories exist.`, `Ask a question to NotebookLM via the skill's ask_question.py script.`, `Load current QA dataset.`, `Load current intent classification data.`, `Extract all categories from QA dataset.` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 26`** (11 nodes): `BasePage.ts`, `LoginPage.ts`, `BasePage`, `.constructor()`, `.getErrorMessage()`, `.navigateTo()`, `.waitForLoadingFinished()`, `LoginPage`, `.constructor()`, `.login()`, `.loginWithRetry()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (9 nodes): `macros.controller.ts`, `MacrosController`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.renderMacro()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (9 nodes): `macros.service.ts`, `MacrosService`, `.constructor()`, `.create()`, `.findAll()`, `.findOne()`, `.remove()`, `.renderMacro()`, `.update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (6 nodes): `roles.service.ts`, `RolesService`, `.constructor()`, `.findAll()`, `.findRoleWithPermissions()`, `.getPermissions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (6 nodes): `customer-announcements.controller.ts`, `CustomerAnnouncementsController`, `.constructor()`, `.getMyAnnouncements()`, `.getMyUnreadCount()`, `.markLogRead()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (6 nodes): `audit-log.interceptor.ts`, `AuditLogInterceptor`, `.constructor()`, `.extractEntityInfo()`, `.intercept()`, `.mapUrlToAction()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (6 nodes): `notifications.controller.ts`, `NotificationsController`, `.constructor()`, `.getMyNotifications()`, `.markAllAsRead()`, `.markAsRead()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (5 nodes): `knowledge-base-approval.controller.ts`, `KnowledgeBaseApprovalController`, `.constructor()`, `.review()`, `.submitForReview()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (5 nodes): `trust-score.calculator.ts`, `TrustScoreCalculator`, `.calculate()`, `.calculateAgeFactor()`, `.calculateFeedbackFactor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (5 nodes): `reports.service.ts`, `ReportsService`, `.constructor()`, `.getAgentPerformance()`, `.getSlaPerformance()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (5 nodes): `reports.controller.ts`, `ReportsController`, `.constructor()`, `.getAgentPerformance()`, `.getSlaPerformance()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (4 nodes): `DashboardPage.ts`, `DashboardPage`, `.constructor()`, `.isAtDashboard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (4 nodes): `layout.tsx`, `not-found.tsx`, `RootLayout()`, `NotFound()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (4 nodes): `rbac.guard.ts`, `RbacGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (4 nodes): `jwt-auth.guard.ts`, `JwtAuthGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `metrics.interceptor.ts`, `MetricsInterceptor`, `.constructor()`, `.intercept()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (4 nodes): `team-scope.guard.ts`, `TeamScopeGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (4 nodes): `ticket-owner.guard.ts`, `TicketOwnerGuard`, `.canActivate()`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (3 nodes): `check-i18n.js`, `getKeys()`, `check-i18n.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (3 nodes): `test_route.ts`, `TestController`, `.getAsset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `CreateAnnouncementTemplateDto`, `UpdateAnnouncementTemplateDto`, `announcement-template.dto.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (3 nodes): `sentry-exception.filter.ts`, `SentryExceptionFilter`, `.catch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (3 nodes): `buildAiQueryWorkerConfig()`, `buildQueueLimiterConfig()`, `ai.module.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (3 nodes): `smtp.validator.ts`, `SmtpValidator`, `.validate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (2 nodes): `AppModule`, `app.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (2 nodes): `customers.module.ts`, `CustomersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (2 nodes): `update-customer-profile.dto.ts`, `UpdateCustomerProfileDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (2 nodes): `import-customers.dto.ts`, `ImportCustomerRecordDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (2 nodes): `register-customer.dto.ts`, `RegisterCustomerDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (2 nodes): `metrics.module.ts`, `MetricsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (2 nodes): `settings.module.ts`, `SettingsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (2 nodes): `bulk-upsert-setting.dto.ts`, `BulkUpsertSettingDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (2 nodes): `upsert-setting.dto.ts`, `UpsertSettingDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (2 nodes): `rbac.module.ts`, `RbacModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (2 nodes): `tickets.module.ts`, `TicketsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (2 nodes): `update-sla-policy.dto.ts`, `UpdateSlaPolicyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (2 nodes): `create-ticket.dto.ts`, `CreateTicketDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (2 nodes): `AddMessageDto`, `add-message.dto.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (2 nodes): `update-ticket.dto.ts`, `UpdateTicketDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (2 nodes): `bulk-update-ticket.dto.ts`, `BulkUpdateTicketDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (2 nodes): `escalate-ticket.dto.ts`, `EscalateTicketDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (2 nodes): `create-sla-policy.dto.ts`, `CreateSlaPolicyDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 107`** (2 nodes): `branding.module.ts`, `BrandingModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (2 nodes): `products.module.ts`, `ProductsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (2 nodes): `redis.module.ts`, `RedisModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (2 nodes): `auth.module.ts`, `AuthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (2 nodes): `login.dto.ts`, `LoginDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (2 nodes): `refresh.guard.ts`, `RefreshGuard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (2 nodes): `faq.module.ts`, `FaqModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (2 nodes): `health.module.ts`, `HealthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (2 nodes): `AnnouncementTemplatesModule`, `announcement-templates.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (2 nodes): `crm.module.ts`, `CrmModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 122`** (2 nodes): `prisma.module.ts`, `PrismaModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 123`** (2 nodes): `AnnouncementsModule`, `announcements.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (2 nodes): `macros.module.ts`, `MacrosModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (2 nodes): `update-macro.dto.ts`, `UpdateMacroDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 127`** (2 nodes): `create-macro.dto.ts`, `CreateMacroDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 128`** (2 nodes): `common.module.ts`, `CommonModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 131`** (2 nodes): `knowledge-base.module.ts`, `KnowledgeBaseModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 132`** (2 nodes): `AiModule`, `ai.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 133`** (2 nodes): `users.module.ts`, `UsersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 134`** (2 nodes): `update-user.dto.ts`, `UpdateUserDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 135`** (2 nodes): `update-profile.dto.ts`, `UpdateProfileDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 136`** (2 nodes): `create-user.dto.ts`, `CreateUserDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 137`** (2 nodes): `omni-channel.module.ts`, `OmniChannelModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 138`** (2 nodes): `teams.module.ts`, `TeamsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 139`** (2 nodes): `knowledge-pool.module.ts`, `KnowledgePoolModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 140`** (2 nodes): `create-knowledge-source.dto.ts`, `CreateKnowledgeSourceDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 141`** (2 nodes): `automation.module.ts`, `AutomationModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 142`** (2 nodes): `email-validator.module.ts`, `EmailValidatorModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 143`** (2 nodes): `attachments.module.ts`, `AttachmentsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 144`** (2 nodes): `webhooks.module.ts`, `WebhooksModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 145`** (2 nodes): `notifications.module.ts`, `NotificationsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 147`** (2 nodes): `email.module.ts`, `EmailModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 148`** (2 nodes): `update-preference.dto.ts`, `UpdateEmailPreferenceDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 149`** (2 nodes): `whatsapp.module.ts`, `WhatsAppModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 150`** (2 nodes): `reports.module.ts`, `ReportsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Error()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`?**
  _High betweenness centrality (0.210) - this node is a cross-community bridge._
- **Why does `t()` connect `Community 0` to `Community 5`, `Community 8`, `Community 12`, `Community 15`, `Community 16`, `Community 21`, `Community 27`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `FaqService` connect `Community 20` to `Community 0`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 209 inferred relationships involving `Error()` (e.g. with `bootstrap()` and `bootstrap()`) actually correct?**
  _`Error()` has 209 INFERRED edges - model-reasoned connections that need verification._
- **Are the 82 inferred relationships involving `t()` (e.g. with `l()` and `handleLookup()`) actually correct?**
  _`t()` has 82 INFERRED edges - model-reasoned connections that need verification._
- **Are the 34 inferred relationships involving `toast()` (e.g. with `handleSave()` and `handleSync()`) actually correct?**
  _`toast()` has 34 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Ensure output directories exist.`, `Ask a question to NotebookLM via the skill's ask_question.py script.`, `Load current QA dataset.` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._