import { createSiteIconResponse } from '@/lib/site-icon';

const size = {
  width: 512,
  height: 512,
};

export function GET() {
  return createSiteIconResponse(size);
}
