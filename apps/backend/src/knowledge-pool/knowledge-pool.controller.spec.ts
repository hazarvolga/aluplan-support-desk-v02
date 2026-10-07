import { ROLES_KEY } from '../rbac/decorators/rbac.decorators';
import { KnowledgePoolController } from './knowledge-pool.controller';

describe('KnowledgePoolController category correction authorization', () => {
    it('restricts category metadata changes to administrators', () => {
        const roles = Reflect.getMetadata(
            ROLES_KEY,
            KnowledgePoolController.prototype.updateSourceCategory,
        );

        expect(roles).toEqual(['admin', 'super-admin']);
    });
});
