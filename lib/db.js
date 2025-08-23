import { neon } from '@neondatabase/serverless';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in environment variables');
}

let sql;
let isInitialized = false;

try {
  sql = neon(process.env.DATABASE_URL);
  console.log('Neon DB connection established');
} catch (error) {
  console.error('Failed to create Neon client:', error);
  throw error;
}

export async function initDatabase() {
  if (isInitialized) return;
  
  try {
    console.log('Initializing database tables...');
    
    // Create notes table
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
    `;
    
    // Create events table
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
    `;
    
    console.log('Database tables initialized successfully');
    isInitialized = true;
    
  } catch (error) {
    console.error('Database initialization error:', error.message);
    throw error;
  }
}

export { sql };
