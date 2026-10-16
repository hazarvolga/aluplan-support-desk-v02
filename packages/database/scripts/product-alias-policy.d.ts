export interface ProductAliasRecord {
    id: string;
    name: string;
    deletedAt?: Date | null;
    isActive?: boolean;
}

export function getProductAliases(canonicalName: string): string[];
export function resolveProductAliasMatch<T extends ProductAliasRecord>(
    canonicalName: string,
    matchingProducts: T[],
): { aliases: string[]; product: T | null };

export interface ProductClient<T extends ProductAliasRecord> {
    findMany(args: { where: { name: { in: string[] } } }): Promise<T[]>;
    create(args: { data: { name: string; description: string; isActive: true } }): Promise<T>;
    update(args: {
        where: { id: string };
        data: { name: string; description: string; isActive: true; deletedAt: null };
    }): Promise<T>;
}

export function syncCanonicalProduct<T extends ProductAliasRecord>(
    productClient: ProductClient<T>,
    definition: { name: string; description: string },
): Promise<T>;
