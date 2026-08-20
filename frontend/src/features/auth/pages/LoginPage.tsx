import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { useLoginMutation } from '../hooks/useLoginMutation';
import { useAuthStore } from '../stores/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const setSession = useAuthStore((state) => state.setSession);
  const hydrate = useAuthStore((state) => state.hydrate);

  async function handleSubmit(
    values: Parameters<typeof AuthForm>[0]['onSubmit'] extends (
      input: infer T
    ) => unknown
      ? T
      : never
  ) {
    try {
      const result = await loginMutation.mutateAsync(values);
      setSession(result.session);
      await hydrate();
      navigate('/dashboard');
    } catch (error) {
      // Error is surfaced by the form and mutation state; keep the page simple.
      console.error(error);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
          Bienvenido
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Iniciar sesión
        </h1>
      </div>

      <AuthForm
        mode="login"
        onSubmit={handleSubmit}
        isBusy={loginMutation.isPending}
      />

      {loginMutation.isError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : 'No se pudo iniciar sesión.'}
        </p>
      )}

      <p className="mt-6 text-sm text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link
          to="/register"
          className="font-medium text-emerald-700 hover:underline"
        >
          Regístrate aquí
        </Link>
      </p>
    </section>
  );
}
