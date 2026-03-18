import { defineConfig } from 'prisma/config';

// In production, DATABASE_URL is provided by the environment
export default defineConfig({
    schema: './node_modules/@aluplan/database/prisma/schema.prisma',
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
