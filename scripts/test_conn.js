import pg from 'pg';

const pass = 's50kKc9BfmJabZ8KOXq0yjzFaVBplAiOPm3yyAedB9TaG09DNBoM4UiJlmujXHqM';

async function testConfig(sslOption) {
  const client = new pg.Client({
    user: 'postgres',
    password: pass,
    host: '84.247.130.122',
    port: 5432,
    database: 'postgres',
    ssl: sslOption
  });

  try {
    console.log(`Probando conexión con ssl = ${JSON.stringify(sslOption)}...`);
    await client.connect();
    console.log('✅ ¡CONEXIÓN EXITOSA!');
    const res = await client.query('SELECT version();');
    console.log('PostgreSQL Version:', res.rows[0].version);
    await client.end();
    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    try { await client.end(); } catch {}
    return false;
  }
}

async function run() {
  let ok = await testConfig(false);
  if (!ok) {
    ok = await testConfig({ rejectUnauthorized: false });
  }
}

run();
