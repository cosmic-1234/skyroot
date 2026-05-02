/**
 * Seed the Render PostgreSQL database remotely.
 * Usage: node seed-remote.js <DATABASE_URL>
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Usage: node seed-remote.js <DATABASE_URL>');
  console.error('   Example: node seed-remote.js "postgresql://user:pass@host/dbname"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    // Step 1: Drop existing tables and run schema
    console.log('🗑️  Dropping existing tables (if any)...');
    await client.query(`
      DROP VIEW IF EXISTS corridor_supplier_health CASCADE;
      DROP VIEW IF EXISTS production_delay_impact CASCADE;
      DROP TABLE IF EXISTS inventory_snapshots CASCADE;
      DROP TABLE IF EXISTS supply_events CASCADE;
      DROP TABLE IF EXISTS launch_material_requirements CASCADE;
      DROP TABLE IF EXISTS material_suppliers CASCADE;
      DROP TABLE IF EXISTS launch_schedule CASCADE;
      DROP TABLE IF EXISTS production_nodes CASCADE;
      DROP TABLE IF EXISTS suppliers CASCADE;
      DROP TABLE IF EXISTS materials CASCADE;
    `);
    console.log('📐 Creating schema...');
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf-8');
    await client.query(schema);
    console.log('   ✅ Schema created (tables, views, indexes)');

    // Step 2: Run seed data
    console.log('🌱 Seeding data...');
    const seed = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf-8');
    await client.query(seed);
    console.log('   ✅ Seed data loaded');

    // Step 3: Verify
    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM materials) AS materials,
        (SELECT COUNT(*) FROM suppliers) AS suppliers,
        (SELECT COUNT(*) FROM production_nodes) AS nodes,
        (SELECT COUNT(*) FROM launch_schedule) AS launches,
        (SELECT COUNT(*) FROM supply_events) AS events,
        (SELECT COUNT(*) FROM inventory_snapshots) AS snapshots
    `);
    const c = counts.rows[0];
    console.log('\n🚀 Database seeded successfully!');
    console.log(`   Materials:  ${c.materials}`);
    console.log(`   Suppliers:  ${c.suppliers}`);
    console.log(`   Nodes:      ${c.nodes}`);
    console.log(`   Launches:   ${c.launches}`);
    console.log(`   Events:     ${c.events}`);
    console.log(`   Snapshots:  ${c.snapshots}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
