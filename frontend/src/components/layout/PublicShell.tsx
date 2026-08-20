import React from 'react';
import Header from '../navigation/Header';

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto p-4">{children}</main>
    </div>
  );
}
