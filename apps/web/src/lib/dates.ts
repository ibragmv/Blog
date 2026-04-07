const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatLongUtcDate(value: number) {
  return longDateFormatter.format(new Date(value));
}

export function formatShortUtcDate(value: number) {
  return shortDateFormatter.format(new Date(value));
}
