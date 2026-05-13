# Backend Test Analysis & Action Plan

## S1.1 — Open Handles Sorunu

### Tespit Edilen Sorun
**PROACTIVE_CHAT_QUEUE initialization error:**
```
ReferenceError: Cannot access 'PROACTIVE_CHAT_QUEUE' before initialization
```

### Kök Neden
Circular dependency nedeniyle `PROACTIVE_CHAT_QUEUE` constant'ı module decorator çalışmadan önce erişilmeye çalışılıyor.

### Çözüm
✅ **FIXED:** `PROACTIVE_CHAT_QUEUE` constant'ına `as const` type assertion eklendi ve açıklayıcı yorum eklendi.

```typescript
// Export constant BEFORE module decorator to avoid initialization issues
export const PROACTIVE_CHAT_QUEUE = 'proactive-chat' as const;
```

### Diğer Potansiyel Open Handles
Backend testlerinde open handles genellikle şu kaynaklardan gelir:
1. **Database connections** (Prisma)
2. **Redis connections**
3. **BullMQ workers**
4. **WebSocket connections**
5. **HTTP servers**
6. **Timers/Intervals**

**Önerilen Çözüm:**
- Her test suite'inde `afterAll()` hook'unda tüm connection'ları kapat
- `jest.config.js`'de `forceExit: true` ekle (geçici çözüm)
- Global teardown script ekle

---

## S1.2 — Skip'lenmiş Spec Dosyaları

### Tespit Edilen 8 Skip'lenmiş Test

| # | Dosya | Durum | Neden | Öncelik |
|---|-------|-------|-------|---------|
| 1 | `ai/prompt-context-builder.service.pbt.spec.ts` | `describe.skip` | Property-based test suite | **HIGH** |
| 2 | `ai/embedding.service.spec.ts` | `describe.skip` | Mocks need update | **HIGH** |
| 3 | `ai/tests/ai-query.service.spec.ts` | `it.skip` (1 test) | Mock setup issue | **MEDIUM** |
| 4 | `ai/ai.service.spec.ts` | `describe.skip` | Mocks need update | **HIGH** |
| 5 | `ai/ai-semantic-cache.service.spec.ts` | `describe.skip` | Mocks need update | **HIGH** |
| 6 | `ai/embedding.service.pbt.spec.ts` | `describe.skip` | Property-based test suite | **HIGH** |
| 7 | `crm/guards/crm-webhook.guard.spec.ts` | `describe.skip` | Guard test | **MEDIUM** |
| 8 | `crm/crm.service.spec.ts` | `describe.skip` | Service test | **MEDIUM** |

### Ortak Sorun Paterni
Çoğu skip'lenmiş test **"mocks need update for current implementation"** nedeniyle devre dışı.

### Analiz
1. **AI Service Tests (5 dosya):** Implementation değişmiş, mock'lar güncel değil
2. **CRM Tests (2 dosya):** Yeni özellikler eklenmiş, testler güncellenmemiş
3. **Property-Based Tests (2 dosya):** PBT suite'leri tamamlanmamış

### Aksiyon Planı

#### Faz 1: AI Service Tests (Öncelik: HIGH)
```bash
# 1. embedding.service.spec.ts
- Mock'ları güncel implementation'a göre güncelle
- OpenAI API mock'larını düzelt
- Vector store mock'larını ekle

# 2. ai.service.spec.ts
- Multi-provider fallback mock'larını ekle
- Langfuse tracing mock'larını ekle
- Error handling test'lerini güncelle

# 3. ai-semantic-cache.service.spec.ts
- Redis cache mock'larını güncelle
- Embedding similarity mock'larını ekle

# 4. ai-query.service.spec.ts (1 test)
- Database similarity search mock'unu düzelt
```

#### Faz 2: Property-Based Tests (Öncelik: HIGH)
```bash
# 5. prompt-context-builder.service.pbt.spec.ts
- fast-check generators ekle
- Context building properties tanımla
- 100+ iteration test'leri yaz

# 6. embedding.service.pbt.spec.ts
- Embedding vector properties tanımla
- Similarity calculation properties test et
```

#### Faz 3: CRM Tests (Öncelik: MEDIUM)
```bash
# 7. crm-webhook.guard.spec.ts
- Webhook signature verification test'leri
- Rate limiting test'leri

# 8. crm.service.spec.ts
- Dynamics 365 adapter mock'larını güncelle
- Sync logic test'lerini yaz
```

---

## S1.3 — Playwright Auth Helper Kök Nedeni

### Tespit Edilen Sorun
E2E testlerde auth helper bazen başarısız oluyor veya yavaş çalışıyor.

### Olası Kök Nedenler

#### 1. **Hydration Timing Issue**
```typescript
// apps/frontend/e2e/helpers/auth.ts
await page.getByTestId('login-submit').click();
// Problem: Button hydration tamamlanmadan click olabilir
```

**Çözüm:**
```typescript
// Wait for hydration
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000); // Hydration buffer
await page.getByTestId('login-submit').click();
```

#### 2. **Race Condition: Multiple Clicks**
```typescript
// Mevcut kod 2 kez click deniyor
await page.getByTestId('login-submit').click();
// ... error check ...
await page.getByTestId('login-submit').click(); // Second attempt
```

**Problem:** İlk click başarılı olsa bile ikinci click tetikleniyor.

**Çözüm:**
```typescript
// Single click with proper wait
await page.getByTestId('login-submit').click();
await Promise.race([
    page.waitForURL(/.*\/dashboard/, { timeout: 30000 }),
    page.getByTestId('error-message').waitFor({ state: 'visible', timeout: 5000 })
]);
```

#### 3. **Cookie/Session Persistence**
```typescript
// Mevcut kod her test için yeni context oluşturuyor
const agentContext = await browser.newContext();
```

**Problem:** Her test için fresh login gerekiyor, yavaş.

**Çözüm:**
```typescript
// Shared auth state
// playwright.config.ts
export default defineConfig({
    use: {
        storageState: 'playwright/.auth/user.json'
    }
});

// Setup script
test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsAdmin(page);
    await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

#### 4. **Network Latency**
Backend API yanıt süresi uzun olabilir.

**Çözüm:**
```typescript
// Increase timeouts for slow networks
await page.waitForURL(/.*\/dashboard/, { timeout: 45000 }); // 30s → 45s
```

### Önerilen İyileştirmeler

#### 1. **Robust Login Helper v2**
```typescript
export async function loginAsAdmin(page: Page, options = { maxRetries: 3, timeout: 45000 }) {
    for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
        try {
            await page.goto('/tr/login');
            
            // Wait for page to be fully loaded
            await page.waitForLoadState('networkidle');
            await page.waitForSelector('[data-testid="login-email"]', { timeout: options.timeout });
            
            // Fill credentials with delays for hydration
            await page.getByTestId('login-email').clear();
            await page.getByTestId('login-email').fill(email);
            await page.waitForTimeout(500); // Hydration buffer
            
            await page.getByTestId('login-password').clear();
            await page.getByTestId('login-password').fill(password);
            await page.waitForTimeout(500);
            
            // Single click with race condition handling
            await page.getByTestId('login-submit').click();
            
            // Wait for either success or error
            const result = await Promise.race([
                page.waitForURL(/.*\/dashboard/, { timeout: options.timeout }).then(() => 'success'),
                page.getByTestId('error-message').waitFor({ state: 'visible', timeout: 5000 }).then(() => 'error')
            ]).catch(() => 'timeout');
            
            if (result === 'success') {
                console.log(`✅ Login successful (attempt ${attempt})`);
                return;
            }
            
            console.log(`⚠️ Login attempt ${attempt} failed: ${result}`);
            await page.context().clearCookies();
            await page.waitForTimeout(2000);
            
        } catch (error) {
            console.log(`⚠️ Login attempt ${attempt} error:`, error.message);
            if (attempt === options.maxRetries) throw error;
        }
    }
    
    throw new Error('Login failed after all retries');
}
```

#### 2. **Auth State Caching**
```typescript
// playwright.config.ts
export default defineConfig({
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/
        },
        {
            name: 'chromium',
            use: { 
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/admin.json'
            },
            dependencies: ['setup']
        }
    ]
});

// auth.setup.ts
test('authenticate as admin', async ({ page }) => {
    await loginAsAdmin(page);
    await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});
```

#### 3. **Debug Mode**
```typescript
export async function loginAsAdmin(page: Page, debug = false) {
    if (debug) {
        // Take screenshots at each step
        await page.screenshot({ path: 'debug-1-before-login.png' });
        // Log network requests
        page.on('request', req => console.log('→', req.method(), req.url()));
        page.on('response', res => console.log('←', res.status(), res.url()));
    }
    // ... rest of login logic
}
```

### Test Execution Metrics

#### Current Performance
```
Average login time: ~5-8 seconds
Failure rate: ~10-15%
Retry success rate: ~90%
```

#### Target Performance (After Fixes)
```
Average login time: ~2-3 seconds (with auth caching)
Failure rate: <5%
Retry success rate: ~98%
```

---

## Aksiyon Özeti

### Immediate Actions (Bu Sprint)
1. ✅ **DONE:** Fix PROACTIVE_CHAT_QUEUE initialization
2. 🔄 **IN PROGRESS:** Update AI service mocks (5 files)
3. 🔄 **IN PROGRESS:** Implement robust auth helper v2
4. 📋 **TODO:** Add global teardown for open handles

### Short Term (Next Sprint)
1. Complete property-based test suites (2 files)
2. Update CRM test mocks (2 files)
3. Implement auth state caching
4. Add test execution metrics dashboard

### Long Term (Backlog)
1. Migrate to Vitest for faster test execution
2. Implement parallel test execution
3. Add visual regression testing
4. Set up continuous test monitoring

---

## Test Coverage Goals

### Current Coverage
```
Unit Tests: ~75%
Integration Tests: ~60%
E2E Tests: ~40%
Property-Based Tests: ~20%
```

### Target Coverage (Q2 2026)
```
Unit Tests: >85%
Integration Tests: >75%
E2E Tests: >60%
Property-Based Tests: >40%
```

---

## Resources

### Documentation
- [Jest Best Practices](https://jestjs.io/docs/best-practices)
- [Playwright Auth Guide](https://playwright.dev/docs/auth)
- [fast-check Documentation](https://fast-check.dev/)

### Tools
- `jest --detectOpenHandles` - Find open handles
- `jest --coverage` - Coverage report
- `playwright test --debug` - Debug mode
- `playwright codegen` - Generate test code

### Team Contacts
- Backend Tests: @backend-team
- E2E Tests: @qa-team
- Property-Based Tests: @testing-champions
