'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AdminNoticeTone = 'error' | 'info' | 'success';

const toneStyles: Record<AdminNoticeTone, string> = {
  error: 'border-red-900/50 bg-red-900/20 text-red-200',
  info: 'border-blue-900/50 bg-blue-900/20 text-blue-200',
  success: 'border-emerald-900/50 bg-emerald-900/20 text-emerald-200',
};

type AdminNoticeProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: AdminNoticeTone;
};

export function AdminNotice({ children, className, title, tone = 'error' }: AdminNoticeProps) {
  return (
    <div className={cn('rounded-md border p-3 text-sm', toneStyles[tone], className)}>
      {title ? <strong className="mr-1">{title}</strong> : null}
      <span>{children}</span>
    </div>
  );
}
