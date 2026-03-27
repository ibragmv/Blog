import { createVercelIconResponse } from '@/lib/vercel-icon';

const size = {
  width: 512,
  height: 512,
};

export function GET() {
  return createVercelIconResponse(size);
}
