import React from 'react';
import Header from '../navigation/Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
