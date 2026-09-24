import { EVENT_LISTENER_METADATA } from '@nestjs/event-emitter/dist/constants';
import { AutoAssignmentService } from './auto-assignment.service';
import { RuleEngineService } from './rule-engine.service';
import { AiAutoResolverService } from '../ai/ai-auto-resolver.service';
import { AiQueryService } from '../ai/ai-query.service';
import { AutomationService } from '../automation/automation.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

// Actual handler metadata, not mocked decorators. This guards join semantics
// for known consumers; it is not full application discovery or persistence proof.
describe('known ticket listener completion contract', () => {
    it.each([
        [AutoAssignmentService, 'handleTicketCreated', 'ticket.created'],
        [RuleEngineService, 'handleTicketCreated', 'ticket.created'],
        [AiAutoResolverService, 'handleTicketCreated', 'ticket.created'],
        [NotificationsGateway, 'emitTicketCreated', 'ticket.created'],
        [AutomationService, 'handleTicketCreated', 'ticket.created'],
        [AiQueryService, 'handleTranslationRequest', 'ai.translate_message'],
    ] as const)(
        '%s.%s returns a joinable, error-contained listener',
        (type, method, event) => {
            const handler = (
                type.prototype as unknown as Record<string, Function>
            )[method];
            expect(handler).toBeDefined();
            const metadata = Reflect.getMetadata(
                EVENT_LISTENER_METADATA,
                handler,
            ) as Array<{
                event: string;
                options?: {
                    async?: boolean;
                    promisify?: boolean;
                    suppressErrors?: boolean;
                };
            }>;
            const entry = metadata.find((item) => item.event === event);
            expect(entry).toBeDefined();
            expect(entry?.options?.suppressErrors).not.toBe(false);
            if (entry?.options?.async)
                expect(entry.options.promisify).toBe(true);
        },
    );
});
