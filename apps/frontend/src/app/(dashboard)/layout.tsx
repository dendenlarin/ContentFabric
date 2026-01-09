'use client';

import { ReactNode } from 'react';
import { AppShell } from '@/components/layout';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout для всех страниц dashboard
 * Оборачивает контент в AppShell с сайдбаром
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
