
import { TemplateService } from './apps/backend/src/email/email.templates';
import * as path from 'path';

async function test() {
    try {
        console.log('Starting Template Compilation Test...');
        const name = 'master-announcement';
        const mockData = {
            ticket: { id: 'TCKT-1234', subject: 'Örnek Destek Talebi', priority: 'HIGH', url: 'http://localhost/tickets/TCKT-4321', first_message_snippet: 'Bu bir örnek mesajdır.' },
            customer: { first_name: 'John', full_name: 'John Doe', email: 'john@example.com' },
            agent: { first_name: 'Jane', full_name: 'Jane Smith' },
            sla: { first_response_deadline: new Date().toLocaleString() },
            contentHtml: '<p>Merhaba Dunya</p>'
        };

        const brandDefaults = {
            name: 'Aluplan',
            logo_url: '/logo.png',
            address: '',
            phone: '',
            email: '',
            social_linkedin: '',
            social_twitter: '',
            social_facebook: '',
            social_instagram: '',
            social_pinterest: '',
            help_center_url: 'https://help.aluplan.com',
        };

        const compiled = TemplateService.compile(name, mockData, brandDefaults);
        console.log('Compilation Success!');
        // console.log('Subject:', compiled.subject);
        // console.log('HTML Length:', compiled.html.length);
    } catch (error) {
        console.error('Compilation Failed!');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

test();
