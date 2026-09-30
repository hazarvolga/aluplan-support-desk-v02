import { test, expect } from '@playwright/test';
import { extractAccessTokenFromSetCookie } from './helpers/auth-cookie';
import { TEST_USERS } from './helpers/auth';

/**
 * OMNI-CHANNEL / WHATSAPP INTEGRATION E2E TEST (v5)
 * Simulates incoming WhatsApp webhook and verifies ticket ingestion.
 */

test.describe('Omni-channel Integration', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('should create a ticket from an incoming WhatsApp message', async ({ page, request }) => {
        const { email: adminEmail, password: adminPassword } = TEST_USERS.admin;

        // E2E customer phone number (reconciled in DB)
        const testPhone = TEST_USERS.customer.phone;
        const testCustomerEmail = TEST_USERS.customer.email;
        const uniqueBody = `E2E WhatsApp Simulation ${Date.now()}`;

        console.log(`Testing with phone: ${testPhone} for customer ${testCustomerEmail}`);

        // 1. Authenticate as Admin to verify/cleanup
        const adminAuth = await request.post('/api/v1/auth/login', {
            data: { email: adminEmail, password: adminPassword }
        });
        expect(adminAuth.ok()).toBeTruthy();
        const access_token = extractAccessTokenFromSetCookie(adminAuth.headers()['set-cookie']);

        // 2. Fetch customer ID
        const customerRes = await request.get(`/api/v1/customers`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        const customers = await customerRes.json();
        const testCustomer = customers.find((c: any) => c.email === testCustomerEmail);
        expect(testCustomer).toBeDefined();

        // 3. CLEANUP: Close any active WHATSAPP tickets for this customer to force a NEW ticket creation
        // This ensures the test is deterministic.
        const activeTicketsRes = await request.get(`/api/v1/tickets?userId=${testCustomer.id}&channel=WHATSAPP`, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });
        const activeTickets = await activeTicketsRes.json();
        if (activeTickets.data && activeTickets.data.length > 0) {
            const toClose = activeTickets.data.filter((t: any) => !['RESOLVED', 'CLOSED'].includes(t.status));
            if (toClose.length > 0) {
                console.log(`🧹 Closing ${toClose.length} active WHATSAPP tickets...`);
                for (const t of toClose) {
                    await request.patch(`/api/v1/tickets/${t.id}/close`, {
                        headers: { 'Authorization': `Bearer ${access_token}` }
                    });
                }
            }
        }

        // 4. Simulate WhatsApp Message via Webhook
        console.log('--- API: Simulating incoming message ---');
        const webhookPayload = {
            object: 'whatsapp_business_account',
            entry: [{
                id: 'WHATSAPP_ID',
                changes: [{
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: { display_phone_number: '123456789', phone_number_id: '987654321' },
                        contacts: [{ profile: { name: 'E2E Tester' }, wa_id: testPhone }],
                        messages: [{
                            from: testPhone,
                            id: `wamid.${Date.now()}`,
                            timestamp: `${Math.floor(Date.now() / 1000)}`,
                            text: { body: uniqueBody },
                            type: 'text'
                        }]
                    },
                    field: 'messages'
                }]
            }]
        };

        const webhookRes = await request.post('/api/v1/webhooks/whatsapp', {
            data: webhookPayload
        });
        expect(webhookRes.ok()).toBeTruthy();

        // 5. Verify Ticket Creation via API with Polling
        console.log('--- API: Polling for ticket creation ---');
        let ticketId = '';
        await expect(async () => {
            const res = await request.get('/api/v1/tickets?channel=WHATSAPP', {
                headers: { 'Authorization': `Bearer ${access_token}` }
            });
            const tickets = await res.json();
            // Search for ticket that has our unique body in subject or description (since simulation might map it)
            const found = tickets.data.find((t: any) =>
                t.status === 'NEW' &&
                (t.description?.includes(uniqueBody) || t.subject?.includes(uniqueBody))
            );
            if (found) {
                ticketId = found.id;
                console.log(`✅ Found ticket: ${ticketId} (${found.ticketNumber})`);
                return true;
            }

            // Fallback: If it appended to an existing ticket despite our cleanup (unlikely but safe check)
            const allWhTickets = tickets.data;
            if (allWhTickets.length > 0) {
                console.log('--- DIAGNOSTIC: Available Ticket Subjects ---');
                allWhTickets.slice(0, 10).forEach((t: any) => console.log(`- ${t.subject} (Channel: ${t.channel})`));
            }
            throw new Error('Ticket not found yet in API');
        }).toPass({ timeout: 120000, intervals: [3000] });

        // 6. Verify in UI by direct navigation
        await page.goto(`/tr/tickets/${ticketId}`);
        await page.waitForURL(new RegExp(`tickets\/${ticketId}`));

        await expect(page.getByText(uniqueBody)).toBeVisible({ timeout: 15000 });
        console.log('✅ Message body visible in UI');

        console.log('✅✅ OMNICHANNEL TEST PASSED');
    });
});
