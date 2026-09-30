# Proactive Chat E2E Tests

## Overview

Comprehensive end-to-end tests for the Proactive Chat feature, covering all major user flows and edge cases.

## Test Scenarios

### 1. Happy Path (Full Flow)
- Agent initiates chat from customer list
- Customer receives invitation and accepts
- Both parties exchange messages
- Typing indicators work correctly
- Agent ends the session
- Both sides see session ended state

**Duration:** ~30 seconds

### 2. Customer Decline
- Agent initiates chat
- Customer receives invitation and declines
- Agent receives decline notification
- Pending badge disappears

**Duration:** ~10 seconds

### 3. Timeout (MISSED)
- Agent initiates chat
- Customer sees invitation but doesn't respond
- After 120 seconds, session times out
- Agent receives missed notification
- Customer invitation disappears

**Duration:** ~125 seconds (includes 120s timeout)

### 4. Ticket Conversion
- Active chat session with messages
- Agent clicks "Convert to Ticket" button
- Ticket is created with all messages copied
- Metadata contains session ID
- Convert button becomes disabled

**Duration:** ~20 seconds

### 5. Multi-Tab Protection
- Customer logged in two browser tabs
- Agent initiates chat
- Only one tab shows the invitation
- Other tab doesn't show duplicate invitation

**Duration:** ~15 seconds

### 6. Session Isolation (Authorization)
- Session created between agent and customer1
- Verify customer1 can access messages
- Verify unauthorized access is rejected
- Verify agent can access (authorized)

**Duration:** ~10 seconds

## Running the Tests

### Prerequisites

1. **Backend must be running:**
   ```bash
   pnpm --filter @aluplan/backend dev
   ```

2. **Frontend must be running:**
   ```bash
   pnpm --filter @aluplan/frontend dev
   ```

3. **Seed only an isolated E2E database:**
   - The database name must end in `_e2e`; `seed-e2e.ts` refuses production mode and other database names.
   - The shared `apps/frontend/e2e/helpers/auth.ts` `TEST_USERS` values are used by the specs and match `apps/backend/seed-e2e.ts`.
   - CI injects disposable `E2E_*` credentials; never point E2E at customer or production data.

### Run All Proactive Chat Tests

```bash
# From workspace root
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts

# With UI (headed mode)
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts --headed

# With debug mode
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts --debug
```

### Run Specific Test

```bash
# Run only happy path test
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts -g "Happy Path"

# Run only timeout test
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts -g "Timeout"
```

### Run with Different Browsers

```bash
# Chromium (default)
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts --project=chromium

# Firefox
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts --project=firefox

# WebKit (Safari)
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts --project=webkit
```

## Test Architecture

### Dual Browser Context Pattern

Tests use two separate browser contexts to simulate real-time interaction:

```typescript
const agentContext = await browser.newContext();
const customerContext = await browser.newContext();

const agentPage = await agentContext.newPage();
const customerPage = await customerContext.newPage();
```

This allows us to:
- Simulate real-time WebSocket events
- Test multi-user scenarios
- Verify authorization and isolation
- Test concurrent actions

### API + UI Hybrid Approach

Tests combine API calls for setup with UI interactions for verification:

```typescript
// Fast setup via API
const session = await apiPost('/proactive-chat/sessions', { customerId }, agentToken);

// UI verification
const chatWindow = agentPage.locator('[data-testid="proactive-chat-window"]');
await expect(chatWindow).toBeVisible();
```

Benefits:
- Faster test execution
- More reliable (less flaky)
- Better separation of concerns
- Easier debugging

## Test Data IDs

All components have `data-testid` attributes for reliable element selection:

### ProactiveChatInvite
- `proactive-chat-invite` - Main invitation card
- `accept-chat-button` - Accept button
- `decline-chat-button` - Decline button

### ProactiveChatWindow
- `proactive-chat-window` - Main chat window
- `chat-message-input` - Message input field
- `chat-send-button` - Send message button
- `typing-indicator` - Typing indicator
- `convert-to-ticket-button` - Convert to ticket button (agent only)
- `end-chat-button` - End session button (agent only)

### ProactiveChatPendingBadge
- `proactive-chat-pending-badge` - Pending badge container
- `pending-countdown` - Countdown timer

### ActiveSessionsPanel
- `active-sessions-panel` - Panel container
- `session-row-{sessionId}` - Individual session row

### Customers Page
- `start-proactive-chat-{customerId}` - Start chat button for each customer

## Debugging Tips

### 1. View Test Execution

```bash
# Run with headed mode to see browser
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts --headed

# Run with slow motion
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts --headed --slow-mo=1000
```

### 2. Inspect Element Selectors

```bash
# Open Playwright Inspector
pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts --debug
```

### 3. View Test Report

```bash
# Generate and open HTML report
pnpm --filter @aluplan/frontend exec playwright show-report
```

### 4. Screenshots on Failure

Screenshots are automatically captured on test failure and saved to:
```
apps/frontend/test-results/
```

### 5. Console Logs

All tests include console.log statements for debugging:
- `✅` - Successful step
- `⏳` - Waiting/in-progress
- `❌` - Error/failure

## Common Issues

### 1. Timeout Test Takes Too Long

The timeout test waits for the full 120 seconds. To speed up during development:

```typescript
// Temporarily reduce timeout in test
const TIMEOUT_SECONDS = 10; // Instead of 120
```

**Note:** Remember to restore to 120 for production tests.

### 2. WebSocket Connection Issues

If WebSocket events aren't being received:

1. Check backend is running: `http://localhost:4000/api/v1/health`
2. Check WebSocket endpoint: `ws://localhost:4000/ws`
3. Verify JWT token is valid
4. Check browser console for errors

### 3. Test Users Don't Exist

Create test users in database:

```sql
-- Check if users exist
SELECT email, "fullName", role FROM users 
WHERE email IN ('hazarvolga@gmail.com', 'e2e-customer@aluplan.com');

-- If missing, create them via API or seed script
```

### 4. Flaky Tests

If tests are flaky:

1. Increase timeouts in `playwright.config.ts`
2. Add explicit waits: `await page.waitForTimeout(1000)`
3. Use `waitForLoadState('networkidle')` after navigation
4. Check for race conditions in WebSocket events

## Performance

### Test Execution Times

| Test | Duration | Notes |
|------|----------|-------|
| Happy Path | ~30s | Full flow with messaging |
| Decline | ~10s | Quick rejection |
| Timeout | ~125s | Includes 120s wait |
| Ticket Conversion | ~20s | API setup + UI verification |
| Multi-Tab | ~15s | Two browser tabs |
| Authorization | ~10s | API-only verification |

**Total:** ~210 seconds (~3.5 minutes)

### Optimization Tips

1. **Run tests in parallel** (default: 2 workers)
2. **Use API for setup** instead of UI clicks
3. **Skip timeout test** during rapid development
4. **Use headed mode** only when debugging

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests - Proactive Chat

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Start backend
        run: pnpm --filter @aluplan/backend dev &
      
      - name: Start frontend
        run: pnpm --filter @aluplan/frontend dev &
      
      - name: Wait for services
        run: |
          npx wait-on http://localhost:4000/api/v1/health
          npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: pnpm --filter @aluplan/frontend exec playwright test e2e/proactive-chat.spec.ts
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
```

## Maintenance

### When to Update Tests

1. **UI Changes:** Update selectors if component structure changes
2. **API Changes:** Update endpoint URLs or request/response formats
3. **Business Logic:** Update test scenarios if requirements change
4. **New Features:** Add new test scenarios

### Test Coverage Checklist

- [x] Agent initiates chat
- [x] Customer accepts chat
- [x] Customer declines chat
- [x] Timeout (MISSED)
- [x] Real-time messaging
- [x] Typing indicators
- [x] Session end
- [x] Ticket conversion
- [x] Multi-tab protection
- [x] Authorization/isolation
- [ ] Disconnect timeout (60s) - TODO
- [ ] Offline customer notification - TODO
- [ ] Multiple concurrent sessions - TODO
- [ ] Message history pagination - TODO

## Related Documentation

- [Proactive Chat Requirements](../../../.kiro/specs/proactive-chat/requirements.md)
- [Proactive Chat Design](../../../.kiro/specs/proactive-chat/design.md)
- [Proactive Chat Tasks](../../../.kiro/specs/proactive-chat/tasks.md)
- [Playwright Documentation](https://playwright.dev/)

## Support

For issues or questions:
1. Check this README
2. Review test output and screenshots
3. Check Playwright documentation
4. Ask in team chat
