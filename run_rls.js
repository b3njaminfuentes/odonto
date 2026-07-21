const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
  });

  try {
    await client.connect();
    const sql = fs.readFileSync('supabase_buckets.sql', 'utf8');
    console.log('Executing Buckets SQL...');
    
    await client.query(sql);
    console.log('Buckets SQL executed successfully!');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

main();
