const CONVEX_UNAVAILABLE_MESSAGE = 'Convex is temporarily unavailable. Please try again.';

type ErrorWithCause = Error & {
  cause?: unknown;
  code?: string;
};

function asError(value: unknown): ErrorWithCause | null {
  return value instanceof Error ? (value as ErrorWithCause) : null;
}

function getErrorChain(error: unknown) {
  const chain: ErrorWithCause[] = [];
  let current = asError(error);
  const seen = new Set<Error>();

  while (current && !seen.has(current)) {
    chain.push(current);
    seen.add(current);
    current = asError(current.cause);
  }

  return chain;
}

export class ConvexServiceUnavailableError extends Error {
  status = 503;

  constructor(message = CONVEX_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = 'ConvexServiceUnavailableError';
  }
}

export function isConvexServiceUnavailableError(error: unknown) {
  if (error instanceof ConvexServiceUnavailableError) {
    return true;
  }

  const chain = getErrorChain(error);

  return chain.some((entry) => {
    const message = entry.message.toLowerCase();
    return (
      entry.code === 'UND_ERR_CONNECT_TIMEOUT' ||
      entry.code === 'UND_ERR_HEADERS_TIMEOUT' ||
      entry.code === 'ECONNREFUSED' ||
      entry.code === 'ENOTFOUND' ||
      message.includes('connect timeout') ||
      message.includes('headers timeout') ||
      message.includes('fetch failed')
    );
  });
}

export function toConvexServiceUnavailableError(error: unknown, message?: string) {
  if (error instanceof ConvexServiceUnavailableError) {
    return error;
  }

  if (!isConvexServiceUnavailableError(error)) {
    return error;
  }

  return new ConvexServiceUnavailableError(message);
}

export function warnOnConvexServiceUnavailable(scope: string, error: unknown) {
  const normalizedError = toConvexServiceUnavailableError(error);

  if (!(normalizedError instanceof ConvexServiceUnavailableError)) {
    return;
  }

  console.warn(`[convex] ${scope}: ${normalizedError.message}`);
}
