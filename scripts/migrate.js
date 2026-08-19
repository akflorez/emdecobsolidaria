import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.argv[2] || process.env.DATABASE_URL || 'postgres://postgres:s50kKc9BfmJabZ8KOXq0yjzFaVBplAiOPm3yyAedB9TaG09DNBoM4UiJlmujXHqM@tijg8g9s9rjgbv50f1pmkaa9:5432/postgres';

console.log('Intentando conectar a la base de datos:', dbUrl.replace(/:[^:@]+@/, ':****@'));

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: false
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL en Coolify!');

    const schemaSqlPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
    const seedSqlPath = path.join(__dirname, '../supabase/seed.sql');

    console.log('📄 Ejecutando 001_initial_schema.sql...');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Esquema inicial, tablas, RLS, vistas e inmutabilidad creadas correctamente.');

    console.log('🌱 Ejecutando seed.sql...');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
    await client.query(seedSql);
    console.log('✅ Municipios del Quindío y categorías insertados correctamente.');

    console.log('🚀 ¡MIGRACIÓN COMPLETADA CON ÉXITO EN COOLIFY!');
  } catch (err) {
    console.error('❌ Error durante la migración:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
