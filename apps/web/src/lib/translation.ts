import { z } from 'zod';

export const TranslationPayloadSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

export type TranslationPayload = z.infer<typeof TranslationPayloadSchema>;

export const TranslationResultSchema = z.object({
  titleEN: z.string().optional(),
  contentEN: z.string().optional(),
});

export type TranslationResult = z.infer<typeof TranslationResultSchema>;

export type TranslationErrorCode =
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'SERVICE_UNAVAILABLE'
  | 'TRANSLATION_FAILED';

export const TranslationErrorCodeSchema = z.enum([
  'INVALID_REQUEST',
  'UNAUTHORIZED',
  'SERVICE_UNAVAILABLE',
  'TRANSLATION_FAILED',
]);

export const TranslationSuccessResponseSchema = z.object({
  data: TranslationResultSchema,
});

export type TranslationSuccessResponse = z.infer<typeof TranslationSuccessResponseSchema>;

export const TranslationErrorResponseSchema = z.object({
  error: z.object({
    code: TranslationErrorCodeSchema,
    message: z.string(),
  }),
});

export type TranslationErrorResponse = z.infer<typeof TranslationErrorResponseSchema>;

export type TranslationResponse = TranslationSuccessResponse | TranslationErrorResponse;
