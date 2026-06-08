// One-shot remote schema + seed loader (Option B).
// Usage: DATABASE_URL="postgresql://...pooler...:5432/postgres" node scripts/db-setup.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Set DATABASE_URL to the Supabase Session-pooler connection string.');
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(here, '..', 'supabase', '_combined_setup.sql'), 'utf8');

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('Connected. Applying schema + RLS + seed…');
  await client.query(sql);
  console.log('✓ Done.');

  const counts = await client.query(`
    select 'service_tiers' t, count(*) n from service_tiers
    union all select 'plans', count(*) from plans
    union all select 'sites', count(*) from sites
    union all select 'profiles', count(*) from profiles
    union all select 'washes', count(*) from washes
    order by t;`);
  console.table(counts.rows);
} catch (e) {
  console.error('✗ Failed:', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
