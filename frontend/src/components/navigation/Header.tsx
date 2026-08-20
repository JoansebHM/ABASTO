import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold">
          ABASTO
        </Link>
        <nav>
          <Link to="/" className="mr-4 text-sm text-gray-700">
            Home
          </Link>
          <Link to="/dashboard" className="text-sm text-gray-700">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
