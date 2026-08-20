import useAuthStore from '@/features/auth/stores/useAuthStore';
import React from 'react';
import { Link } from 'react-router-dom';

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((state) => !!state.session);

  if (!isAuthenticated) {
    return (
      <div className="p-6 flex h-screen items-center justify-center flex-col">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-gray-600">
          Debe iniciar sesión para acceder a esta sección.
        </p>
        <Link to="/login" className="mt-4 text-blue-600 bg-inherit">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
