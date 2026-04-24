const bcrypt = require('bcryptjs'); // or bcrypt depending on what's installed
let hashFunction;
try {
    const bcryptLib = require('bcrypt');
    hashFunction = bcryptLib.hash;
} catch (e) {
    const bcryptjsLib = require('bcryptjs');
    hashFunction = bcryptjsLib.hash;
}

const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

async function setPassword() {
    console.log('🚀 Updating password...');
    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL environment variable is missing.');
        process.exit(1);
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        const passwordHash = await hashFunction('Vol?*187', 10);

        let result = await pool.query(
            'UPDATE "users" SET "passwordHash" = $1 WHERE "email" = $2',
            [passwordHash, 'hazarvolga@gmail.com']
        );
        console.log('Updated hazarvolga@gmail.com rows:', result.rowCount);

        if (result.rowCount === 0) {
            result = await pool.query(
                'UPDATE "users" SET "passwordHash" = $1 WHERE "email" = $2',
                [passwordHash, 'admin@aluplan.com']
            );
            console.log('Updated admin@aluplan.com rows:', result.rowCount);
        }

        console.log('✅ Success! Password has been updated to Vol?*187.');
    } catch (err) {
        console.error('❌ Failed to update password:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

setPassword();
