export type TranslationPayload = {
  title?: string;
  content?: string;
};

export type TranslationResult = {
  titleEN?: string;
  contentEN?: string;
};

export type TranslationErrorCode =
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'SERVICE_UNAVAILABLE'
  | 'TRANSLATION_FAILED';

export type TranslationSuccessResponse = {
  data: TranslationResult;
};

export type TranslationErrorResponse = {
  error: {
    code: TranslationErrorCode;
    message: string;
  };
};

export type TranslationResponse = TranslationSuccessResponse | TranslationErrorResponse;
