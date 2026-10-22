'use strict';

const PRODUCT_ALIASES = Object.freeze({
    'CDS Add-On': Object.freeze(['CDS Add-On', 'CDS Add-on']),
});

function getProductAliases(canonicalName) {
    return PRODUCT_ALIASES[canonicalName] || [canonicalName];
}

function resolveProductAliasMatch(canonicalName, matchingProducts) {
    const aliases = getProductAliases(canonicalName);
    if (matchingProducts.length > 1) {
        throw new Error(`Duplicate product aliases require manual reconciliation: ${aliases.join(', ')}`);
    }
    return { aliases, product: matchingProducts[0] || null };
}

async function syncCanonicalProduct(productClient, definition) {
    const aliases = getProductAliases(definition.name);
    const matchingProducts = await productClient.findMany({ where: { name: { in: aliases } } });
    const { product } = resolveProductAliasMatch(definition.name, matchingProducts);

    if (!product) {
        return productClient.create({
            data: { name: definition.name, description: definition.description, isActive: true },
        });
    }

    return productClient.update({
        where: { id: product.id },
        data: {
            name: definition.name,
            description: definition.description,
            isActive: true,
            deletedAt: null,
        },
    });
}

module.exports = { getProductAliases, resolveProductAliasMatch, syncCanonicalProduct };
