import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const events = await sql`SELECT * FROM events ORDER BY start_time`;
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, description, start_time, end_time, all_day } = await request.json();
    
    const event = await sql`
      INSERT INTO events (title, description, start_time, end_time, all_day) 
      VALUES (${title}, ${description}, ${start_time}, ${end_time}, ${all_day})
      RETURNING *
    `;
    
    return NextResponse.json(event[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
