import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force load the root .env file from the correct relative path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
    earlyAccess: true,
    schema: 'prisma/schema.prisma',
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
