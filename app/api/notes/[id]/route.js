import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;
    const { id } = params;

    const note = await sql`SELECT * FROM notes WHERE id = ${id}`;
    if (!note[0]) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note[0].secret && !isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized to view secret note' }, { status: 401 });
    }

    return NextResponse.json(note[0]);
  } catch (error) {
    console.error('Database error in GET /api/notes/[id]:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch note', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;
    const { id } = params;

    const { title, content, type, priority, completed, due_date, secret } = await request.json();

    const existingNote = await sql`SELECT * FROM notes WHERE id = ${id}`;
    if (!existingNote[0]) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if ((existingNote[0].secret || secret) && !isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized to update secret note' }, { status: 401 });
    }

    const dueDateValue = due_date ? new Date(due_date).toISOString() : null;

    const note = await sql`
      UPDATE notes
      SET title = ${title},
          content = ${content || ''},
          type = ${type},
          priority = ${priority},
          completed = ${completed},
          due_date = ${dueDateValue},
          secret = ${secret},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(note[0]);
  } catch (error) {
    console.error('Database error in PUT /api/notes/[id]:', error.message);
    return NextResponse.json(
      { error: 'Failed to update note', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;
    const { id } = params;

    const existingNote = await sql`SELECT * FROM notes WHERE id = ${id}`;
    if (!existingNote[0]) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existingNote[0].secret && !isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized to delete secret note' }, { status: 401 });
    }

    await sql`DELETE FROM notes WHERE id = ${id}`;
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Database error in DELETE /api/notes/[id]:', error.message);
    return NextResponse.json(
      { error: 'Failed to delete note', message: error.message },
      { status: 500 }
    );
  }
}

