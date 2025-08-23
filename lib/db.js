import { neon } from '@neondatabase/serverless'


if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables')
}


let globalSql = globalThis.sql || null
let globalInit = globalThis.isInitialized || false

if (!globalSql) {
  globalSql = neon(process.env.DATABASE_URL)
  console.log('✅ Neon DB client created')
  globalThis.sql = globalSql
}

export const sql = globalSql

export async function initDatabase() {
  if (globalInit) return
  try {
    console.log('⚡ Initializing database tables...')

    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        type VARCHAR(50) DEFAULT 'note',
        priority VARCHAR(20) DEFAULT 'medium',
        completed BOOLEAN DEFAULT FALSE,
        due_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE,
        all_day BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    console.log('✅ Database tables ready')
    globalThis.isInitialized = true
  } catch (error) {
    console.error('❌ Database initialization error:', error.message)
    throw error
  }
}

