import { ValidationPipe } from '@nestjs/common';
import { CloseTicketDto, ReopenRequestDto, ResolutionDecisionDto } from './ticket-lifecycle.dto';

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
    it.each([CloseTicketDto, ReopenRequestDto])('requires a strict explanation in %p', async metatype => {
        const field = metatype === CloseTicketDto ? 'reason' : 'comment';
        for (const value of [undefined, null, '', ' ', 7, true, 'x'.repeat(2001)]) {
            await expect(body(metatype, { [field]: value })).rejects.toThrow();
        }
    });
});
