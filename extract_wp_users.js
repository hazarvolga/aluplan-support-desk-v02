const fs = require('fs');
const readline = require('readline');

async function extractUsers() {
    console.log('SQL dosyasından kullanıcılar okunuyor...');

    const fileStream = fs.createReadStream('/Users/hazarekiz/Projects/aluplan-support-desk-V02/wordpress_1_2025-09-23_13-22-07.sql');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const customers = new Map();

    for await (const line of rl) {
        if (line.startsWith("INSERT INTO `TTKsK_users` VALUES ")) {
            // Remove the INSERT part and the trailing ;
            let data = line.substring(line.indexOf('VALUES (') + 7, line.length - 1);

            // This regex tries to split by ),( taking care of possible commas inside string literals
            // Since it's tough to perfectly parse SQL tuples with a regex, we can use a small state machine or carefully crafted regex.
            // A trick is to match complete tuples like (1, 'login', 'pass', 'name', 'email', 'url', 'registered', 'key', 0, 'display')
            const tupleRegex = /\((\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',.*?,\s*'([^']*)'\)/g;

            let match;
            while ((match = tupleRegex.exec(line)) !== null) {
                // Groups based on standard WP wp_users structure:
                // 1: ID
                // 2: user_login
                // 3: user_pass
                // 4: user_nicename
                // 5: user_email
                // etc... display_name is last.

                // But let's just do a simpler search for emails since we need email and display name.
                // Actually we know the 5th element is email.
            }

            // Let's do a much safer string split by "),"
            let rows = data.split(/\),\(/);
            for (let row of rows) {
                // remove leading ( or trailing )
                if (row.startsWith('(')) row = row.substring(1);
                if (row.endsWith(')')) row = row.substring(0, row.length - 1);

                // split by comma, but only outside single quotes
                const fields = row.match(/('([^'\\]*(?:\\.[^'\\]*)*)'|[^,]+)/g);

                if (fields && fields.length >= 10) {
                    const emailRaw = fields[4];
                    const displayNameRaw = fields[9];

                    if (emailRaw && displayNameRaw && emailRaw.includes('@')) {
                        const email = emailRaw.replace(/^'|'$/g, '').replace(/\\'/g, "'").trim().toLowerCase();
                        const displayName = displayNameRaw.replace(/^'|'$/g, '').replace(/\\'/g, "'").trim();
                        if (email && email.includes('@')) {
                            customers.set(email, {
                                name: displayName,
                                email: email,
                                source: 'wordpress_users'
                            });
                        }
                    }
                }
            }
            break; // Stop reading after we found the TTKsK_users inserts
        }
    }

    console.log(`Toplam ${customers.size} benzersiz kullanıcı çıkarıldı!`);

    const results = Array.from(customers.values());
    fs.writeFileSync('extracted_users.json', JSON.stringify(results, null, 2));
    console.log('Kullanıcılar extracted_users.json dosyasına kaydedildi. Birkaç örnek:');
    console.log(results.slice(0, 3));
}

extractUsers().catch(console.error);
