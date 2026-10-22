import { ROLES_KEY } from '../rbac/decorators/rbac.decorators';
import { ProactiveChatController } from './proactive-chat.controller';

describe('ProactiveChatController role contract', () => {
    const supportAgentActions = [
        ProactiveChatController.prototype.createSession,
        ProactiveChatController.prototype.acceptSession,
        ProactiveChatController.prototype.declineSession,
        ProactiveChatController.prototype.endSession,
        ProactiveChatController.prototype.sendMessage,
        ProactiveChatController.prototype.getMessages,
        ProactiveChatController.prototype.convertToTicket,
    ];

    it.each(supportAgentActions)('allows support staff roles for chat actions', (handler) => {
        const roles = Reflect.getMetadata(ROLES_KEY, handler);
        expect(roles).toEqual(expect.arrayContaining(['support_agent', 'support_manager']));
    });
});
