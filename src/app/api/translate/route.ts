import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminAuthorizationError, requireAdminSession } from '@/lib/server/admin-auth';
import {
  TranslationServiceUnavailableError,
  translateArchiveEntry,
} from '@/lib/server/translation';
import type { TranslationErrorCode } from '@/lib/translation';

const optionalTranslationField = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim().length === 0 ? undefined : value;
}, z.string().max(120_000).optional());

const translateSchema = z
  .object({
    title: optionalTranslationField,
    content: optionalTranslationField,
  })
  .refine((value) => Boolean(value.title || value.content), {
    message: 'Provide a non-empty title or content to translate.',
  });

function createErrorResponse(status: number, code: TranslationErrorCode, message: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Unauthorized.');
    }

    console.error('Unexpected admin session error during translation auth.', error);
    return createErrorResponse(500, 'TRANSLATION_FAILED', 'Translation failed.');
  }

  const requestBody = await request.json().catch(() => null);
  const payload = translateSchema.safeParse(requestBody);

  if (!payload.success) {
    return createErrorResponse(
      400,
      'INVALID_REQUEST',
      'Provide a non-empty title or content to translate.'
    );
  }

  try {
    const data = await translateArchiveEntry(payload.data);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof TranslationServiceUnavailableError) {
      return createErrorResponse(
        503,
        'SERVICE_UNAVAILABLE',
        'Translation is currently unavailable.'
      );
    }

    console.error('Translation request failed.', error);
    return createErrorResponse(502, 'TRANSLATION_FAILED', 'Translation failed.');
  }
}
