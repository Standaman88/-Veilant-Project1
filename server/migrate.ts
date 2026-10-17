import { readFile } from 'node:fs/promises'
import { pool } from './db.js'

async function migrateDatabase() {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured. Set it before applying the schema.')
  }

  try {
    const schema = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8')
    await pool.query(schema)
    console.log('PostgreSQL schema is up to date.')
  } finally {
    await pool.end()
  }
}

migrateDatabase().catch((error: unknown) => {
  console.error('Database migration failed:', error)
  process.exitCode = 1
})
