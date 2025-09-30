import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Breadcrumb } from './Breadcrumb';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Breadcrumb />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}