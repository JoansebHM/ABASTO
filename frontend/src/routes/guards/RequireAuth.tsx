import React from 'react';

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 text-gray-600">
          Debe iniciar sesión para acceder a esta sección.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
