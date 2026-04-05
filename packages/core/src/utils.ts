import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDisplayOrder(value: number) {
  return Math.max(1, Math.trunc(value)).toString().padStart(2, '0');
}
