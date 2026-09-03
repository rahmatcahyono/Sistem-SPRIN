import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.includes('authjs') || cookie.name.includes('next-auth')) {
      cookieStore.delete(cookie.name);
    }
  }
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.includes('authjs') || cookie.name.includes('next-auth')) {
      cookieStore.delete(cookie.name);
    }
  }
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}
