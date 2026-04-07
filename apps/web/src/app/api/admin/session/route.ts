import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminSessionSchema } from '@/lib/content';
import { getCurrentAdminSession, signInAdmin, signOutAdmin } from '@/lib/server/admin-auth';

const adminLoginSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function GET() {
  const session = await getCurrentAdminSession();
  return NextResponse.json(AdminSessionSchema.parse(session));
}

export async function POST(request: Request) {
  const requestBody: unknown = await request.json().catch(() => null);
  const payload = adminLoginSchema.safeParse(requestBody);

  if (!payload.success) {
    return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 });
  }

  try {
    const session = await signInAdmin(payload.data.email, payload.data.password);
    return NextResponse.json(AdminSessionSchema.parse(session));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign in.';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function DELETE() {
  const session = await signOutAdmin();
  return NextResponse.json(AdminSessionSchema.parse(session));
}
