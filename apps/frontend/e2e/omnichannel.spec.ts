import { test, expect } from '@playwright/test';
import { createHmac } from 'node:crypto';
import { extractAccessTokenFromSetCookie } from './helpers/auth-cookie';
import { TEST_USERS } from './helpers/auth';

const API_ORIGIN = 'http://localhost:4000';

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
        const adminAuth = await request.post(`${API_ORIGIN}/api/v1/auth/login`, {
            data: { email: adminEmail, password: adminPassword },
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        });
        expect(
            adminAuth.ok(),
            `Admin login failed (${adminAuth.status()}): ${await adminAuth.text()}`,
        ).toBeTruthy();
        const setCookie = adminAuth.headersArray()
            .filter(({ name }) => name.toLowerCase() === 'set-cookie')
            .map(({ value }) => value)
            .join(', ');
        const access_token = extractAccessTokenFromSetCookie(setCookie);
        const csrfToken = (await request.storageState()).cookies
            .find(({ name }) => name === 'XSRF-TOKEN')?.value;
        expect(csrfToken).toBeTruthy();
        const authHeaders = {
            Authorization: `Bearer ${access_token}`,
            'X-XSRF-TOKEN': csrfToken!,
            'X-Requested-With': 'XMLHttpRequest',
        };

        // 2. Fetch customer ID
        const customerRes = await request.get(`${API_ORIGIN}/api/v1/customers`, {
            headers: authHeaders,
        });
        expect(
            customerRes.ok(),
            `Customer lookup failed (${customerRes.status()}): ${await customerRes.text()}`,
        ).toBeTruthy();
        const customers = await customerRes.json();
        const customerList = Array.isArray(customers) ? customers : (customers.data ?? []);
        const testCustomer = customerList.find((customer: any) => customer.email === testCustomerEmail);
        expect(testCustomer).toBeDefined();

        // 3. CLEANUP: Close any active WHATSAPP tickets for this customer to force a NEW ticket creation
        // This ensures the test is deterministic.
        const activeTicketsRes = await request.get(`${API_ORIGIN}/api/v1/tickets?userId=${testCustomer.id}&channel=WHATSAPP`, {
            headers: authHeaders,
        });
        const activeTickets = await activeTicketsRes.json();
        if (activeTickets.data && activeTickets.data.length > 0) {
            const toClose = activeTickets.data.filter((t: any) => !['RESOLVED', 'CLOSED'].includes(t.status));
            if (toClose.length > 0) {
                console.log(`🧹 Closing ${toClose.length} active WHATSAPP tickets...`);
                for (const t of toClose) {
                    await request.patch(`${API_ORIGIN}/api/v1/tickets/${t.id}/close`, {
                        headers: authHeaders,
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
        const webhookSecret = process.env.WHATSAPP_APP_SECRET;
        expect(webhookSecret, 'WHATSAPP_APP_SECRET must be set for signed webhook E2E').toBeTruthy();
        const rawPayload = JSON.stringify(webhookPayload);
        const signature = createHmac('sha256', webhookSecret!).update(rawPayload).digest('hex');

        const webhookRes = await request.post(`${API_ORIGIN}/api/v1/whatsapp/webhook`, {
            data: rawPayload,
            headers: {
                'Content-Type': 'application/json',
                'x-hub-signature-256': `sha256=${signature}`,
            },
        });
        expect(
            webhookRes.ok(),
            `WhatsApp webhook failed (${webhookRes.status()}): ${await webhookRes.text()}`,
        ).toBeTruthy();

        // 5. Verify Ticket Creation via API with Polling
        console.log('--- API: Polling for ticket creation ---');
        let ticketId = '';
        await expect(async () => {
            const res = await request.get(`${API_ORIGIN}/api/v1/tickets?channel=WHATSAPP`, {
                headers: authHeaders,
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

        await expect(page.getByText(uniqueBody, { exact: true })).toBeVisible({ timeout: 15000 });
        console.log('✅ Message body visible in UI');

        console.log('✅✅ OMNICHANNEL TEST PASSED');
    });
});
