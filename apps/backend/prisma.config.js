/** @type {import('prisma').Config} */
module.exports = {
    schema: './node_modules/@aluplan/database/prisma/schema.prisma',
    url: process.env.DATABASE_URL
}
