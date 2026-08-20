import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { useRegisterMutation } from '../hooks/useRegisterMutation';
import { useAuthStore } from '../stores/useAuthStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
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
      const result = await registerMutation.mutateAsync(values);
      if (result.session) {
        setSession(result.session);
        await hydrate();
      }
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
          Primer paso
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Crear cuenta</h1>
      </div>

      <AuthForm
        mode="register"
        onSubmit={handleSubmit}
        isBusy={registerMutation.isPending}
      />

      {registerMutation.isError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {registerMutation.error instanceof Error
            ? registerMutation.error.message
            : 'No se pudo completar el registro.'}
        </p>
      )}

      <p className="mt-6 text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="font-medium text-emerald-700 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}
