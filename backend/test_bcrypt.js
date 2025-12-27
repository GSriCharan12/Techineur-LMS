const bcrypt = require('bcryptjs');

async function testBcrypt() {
    try {
        const hash = await bcrypt.hash('password', 10);
        console.log('Hash:', hash);
        const match = await bcrypt.compare('password', hash);
        console.log('Match:', match);
    } catch (e) {
        console.error('Bcrypt error:', e.message);
    }
    process.exit(0);
}

testBcrypt();
