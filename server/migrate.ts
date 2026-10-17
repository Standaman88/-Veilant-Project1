import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pool } from './db.js'

async function migrateDatabase() {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured. Set it before applying the schema.')
  }

  try {
    const schema = await readFile(resolve(process.cwd(), 'database/schema.sql'), 'utf8')
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
