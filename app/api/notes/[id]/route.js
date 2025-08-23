import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { title, content, type, priority, completed, due_date } = await request.json();
    
    console.log('Updating note:', id, { title, content, type, priority, completed, due_date });
    
    const note = await sql`
      UPDATE notes 
      SET title = ${title}, content = ${content}, type = ${type}, 
          priority = ${priority}, completed = ${completed}, due_date = ${due_date},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    console.log('Note updated:', note[0]);
    return NextResponse.json(note[0]);
  } catch (error) {
    console.error('Database error in PUT /api/notes/[id]:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to update note',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log('Deleting note:', id);
    
    await sql`DELETE FROM notes WHERE id = ${id}`;
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Database error in DELETE /api/notes/[id]:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to delete note',
        message: error.message
      },
      { status: 500 }
    );
  }
}
