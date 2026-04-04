import { ADMIN_SESSION_EXPIRED_MESSAGE } from '@/lib/admin-auth-shared';
import type {
  TranslationErrorCode,
  TranslationErrorResponse,
  TranslationPayload,
  TranslationResult,
  TranslationSuccessResponse,
} from '@/lib/translation';

export class TranslationApiError extends Error {
  code: TranslationErrorCode;
  status: number;

  constructor(message: string, status: number, code: TranslationErrorCode) {
    super(message);
    this.name = 'TranslationApiError';
    this.status = status;
    this.code = code;
  }
}

function getFallbackErrorMessage(status: number) {
  if (status === 401) {
    return ADMIN_SESSION_EXPIRED_MESSAGE;
  }

  if (status === 400) {
    return 'Provide a non-empty title or content to translate.';
  }

  if (status === 503) {
    return 'Translation is currently unavailable.';
  }

  return 'Translation failed.';
}

function isTranslationErrorResponse(payload: unknown): payload is TranslationErrorResponse {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) {
    return false;
  }

  const error = payload.error;
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      typeof error.code === 'string' &&
      'message' in error &&
      typeof error.message === 'string'
  );
}

async function readTranslationResponse(response: Response): Promise<TranslationResult> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const code =
      isTranslationErrorResponse(payload) && payload.error.code
        ? payload.error.code
        : 'TRANSLATION_FAILED';
    const message =
      isTranslationErrorResponse(payload) && payload.error.message
        ? payload.error.message
        : getFallbackErrorMessage(response.status);

    throw new TranslationApiError(message, response.status, code);
  }

  const data = payload as TranslationSuccessResponse | null;

  if (!data?.data || typeof data.data !== 'object') {
    throw new TranslationApiError('Translation failed.', response.status, 'TRANSLATION_FAILED');
  }

  return data.data;
}

export async function translatePost(payload: TranslationPayload): Promise<TranslationResult> {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readTranslationResponse(response);
}
