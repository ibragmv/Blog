import { NextResponse } from 'next/server';
import { RSS_ICON_PATH } from '@/lib/rss';

export function GET(request: Request) {
  return NextResponse.redirect(new URL(RSS_ICON_PATH, request.url), 308);
}
