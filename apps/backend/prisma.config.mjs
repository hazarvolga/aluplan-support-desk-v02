export default {
    datasource: {
        url: process.env.DATABASE_URL
    },
    schema: {
        kind: 'static',
        filePath: './packages/database/prisma/schema.prisma'
    }
}
