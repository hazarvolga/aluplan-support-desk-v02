import { ValidationPipe } from '@nestjs/common';
import { CloseTicketDto, ReopenRequestDto, ResolutionDecisionDto } from './ticket-lifecycle.dto';
import { UpdateTicketDto } from './update-ticket.dto';
import { BulkUpdateTicketDto } from './bulk-update-ticket.dto';

describe('Lifecycle action body validation', () => {
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true,
        transformOptions: { enableImplicitConversion: true } });
    const body = (metatype: any, value: unknown) => pipe.transform(value, { type: 'body', metatype });
    it('accepts explicit resolution decisions', async () => {
        await expect(body(ResolutionDecisionDto, { decision: 'CONFIRM' })).resolves.toMatchObject({ decision: 'CONFIRM' });
        await expect(body(ResolutionDecisionDto, { decision: 'CONTINUE', comment: 'Still failing' })).resolves.toMatchObject({ decision: 'CONTINUE' });
    });
    it.each([{}, { decision: 'CLOSED' }, { decision: 'CONFIRM', score: 5 }, { decision: 'CONFIRM', comment: 7 }])(
        'rejects invalid or extra resolution input %p', async payload => {
            await expect(body(ResolutionDecisionDto, payload)).rejects.toThrow();
        });
    it('allows an omitted staff closure reason while validating supplied explanations', async () => {
        await expect(body(CloseTicketDto, {})).resolves.toBeInstanceOf(CloseTicketDto);
        for (const reason of ['', ' ']) await expect(body(CloseTicketDto, { reason })).resolves.toBeInstanceOf(CloseTicketDto);
        for (const reason of [null, 7, true, 'x'.repeat(2001)]) {
            await expect(body(CloseTicketDto, { reason })).rejects.toThrow();
        }
    });
    it('continues to require a strict reopen explanation', async () => {
        for (const comment of [undefined, null, '', ' ', 7, true, 'x'.repeat(2001)]) {
            await expect(body(ReopenRequestDto, { comment })).rejects.toThrow();
        }
    });
    it.each([UpdateTicketDto, BulkUpdateTicketDto])('generic and bulk DTO permit omitted/blank closeReason in %p', async metatype => {
        const ticketFields = metatype === BulkUpdateTicketDto ? { ticketIds: ['bfaa5692-5b7d-40fb-94fd-b6ac12abaaff'] } : {};
        for (const closeReason of [undefined, '', '   ']) {
            await expect(body(metatype, { ...ticketFields, status: 'CLOSED', closeReason })).resolves.toBeInstanceOf(metatype);
        }
        for (const closeReason of [7, true, 'x'.repeat(2001)]) {
            await expect(body(metatype, { ...ticketFields, status: 'CLOSED', closeReason })).rejects.toThrow();
        }
    });
});
