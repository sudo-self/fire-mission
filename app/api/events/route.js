import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';


export async function GET() {
  try {
    const events = await sql`
      SELECT * FROM events 
      ORDER BY start_time ASC
    `;
    return NextResponse.json(events);
  } catch (error) {
    console.error('GET /events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, start_time, end_time, all_day } = body;

    if (!title || !start_time) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_time' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO events (title, description, start_time, end_time, all_day) 
      VALUES (${title}, ${description}, ${start_time}, ${end_time}, ${all_day ?? false})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST /events error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

