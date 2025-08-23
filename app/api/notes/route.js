import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching notes from database...');
    const notes = await sql`SELECT * FROM notes ORDER BY created_at DESC`;
    console.log('Notes fetched successfully:', notes.length);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Database error in GET /api/notes:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch notes',
        message: error.message,
        details: 'Check database connection and table structure'
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Creating note with data:', body);
    
    const { title, content, type = 'note', priority = 'medium', due_date = null } = body;
    
    // Handle date conversion properly
    let dueDateValue = null;
    if (due_date) {
      dueDateValue = new Date(due_date).toISOString();
    }
    
    const note = await sql`
      INSERT INTO notes (title, content, type, priority, due_date) 
      VALUES (${title}, ${content || ''}, ${type}, ${priority}, ${dueDateValue})
      RETURNING *
    `;
    
    console.log('Note created successfully:', note[0]);
    return NextResponse.json(note[0]);
    
  } catch (error) {
    console.error('Database error in POST /api/notes:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to create note',
        message: error.message,
        details: 'Check the data being sent and database constraints'
      },
      { status: 500 }
    );
  }
}
