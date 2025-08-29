import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;

 
    const notes = await sql`
      SELECT *
      FROM notes
      WHERE secret = false OR (secret = true AND ${isLoggedIn})
      ORDER BY created_at DESC
    `;

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Database error in GET /api/notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes', message: error.message },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;

    const {
      title,
      content,
      type = 'note',
      priority = 'medium',
      due_date = null,
      secret = false,
    } = await request.json();

    if (secret && !isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized to create secret note' },
        { status: 401 }
      );
    }

    const dueDateValue = due_date ? new Date(due_date).toISOString() : null;

    const [note] = await sql`
      INSERT INTO notes (title, content, type, priority, due_date, secret)
      VALUES (${title}, ${content || ''}, ${type}, ${priority}, ${dueDateValue}, ${secret})
      RETURNING *
    `;

    return NextResponse.json(note);
  } catch (error) {
    console.error('Database error in POST /api/notes:', error);
    return NextResponse.json(
      { error: 'Failed to create note', message: error.message },
      { status: 500 }
    );
  }
}
