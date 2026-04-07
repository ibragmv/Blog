'use client';

import { useSearchParams } from 'next/navigation';
import {
  ADMIN_SERVICE_UNAVAILABLE_MESSAGE,
  ADMIN_SERVICE_UNAVAILABLE_TITLE,
} from '@/lib/admin-client-auth';

const ADMIN_NOTICE_PREVIEW_PARAM = '__admin_notice';
const SERVICE_UNAVAILABLE_PREVIEW_VALUE = 'service-unavailable';

type AdminNoticePreview = {
  message: string;
  title?: string;
} | null;

export function useAdminNoticePreview(): AdminNoticePreview {
  const searchParams = useSearchParams();

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const previewValue = searchParams.get(ADMIN_NOTICE_PREVIEW_PARAM);

  if (previewValue !== SERVICE_UNAVAILABLE_PREVIEW_VALUE) {
    return null;
  }

  return {
    title: ADMIN_SERVICE_UNAVAILABLE_TITLE,
    message: ADMIN_SERVICE_UNAVAILABLE_MESSAGE,
  };
}
