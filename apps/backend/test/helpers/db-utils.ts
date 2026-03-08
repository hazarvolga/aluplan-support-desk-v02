import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * Truncates all tables in the database to ensure a clean state between integration tests.
 * This is faster than dropping and recreating the schema.
 */
export async function truncateDatabase(prisma: PrismaService) {
    const models = Object.keys(prisma).filter((key) => !key.startsWith('_') && !key.startsWith('$'));

    for (const model of models) {
        try {
            // Use dynamic access to the model's deleteMany method
            const modelProperty = (prisma as any)[model];
            if (modelProperty && typeof modelProperty.deleteMany === 'function') {
                await modelProperty.deleteMany();
            }
        } catch (error) {
            console.error(`Failed to truncate table: ${model}`, error);
        }
    }
}
