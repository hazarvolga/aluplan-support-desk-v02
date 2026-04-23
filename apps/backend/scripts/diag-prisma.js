
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma product.findMany()...');
    try {
        const products = await prisma.product.findMany({
            include: { categories: true }
        });
        console.log('Successfully fetched products:', products.length);
    } catch (err) {
        console.error('Prisma Error Details:');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        console.error('Meta:', err.meta);
        if (err.stack) console.error('Stack:', err.stack);
    } finally {
        await prisma.$disconnect();
    }
}

main();
