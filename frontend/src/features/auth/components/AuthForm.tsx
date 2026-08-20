import { Role } from '@/lib/domain';
import { valibotResolver } from '@/lib/valibotResolver';
import { useForm } from 'react-hook-form';
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '../schemas/auth.schema';

export type AuthFormMode = 'login' | 'register';

export interface AuthFormProps {
  mode?: AuthFormMode;
  onSubmit: (
    values: RegisterFormValues | LoginFormValues
  ) => void | Promise<void>;
  submitLabel?: string;
  isBusy?: boolean;
  className?: string;
}

export function AuthForm({
  mode = 'login',
  onSubmit,
  submitLabel,
  isBusy = false,
  className = '',
}: AuthFormProps) {
  const isRegister = mode === 'register';

  const registerForm = useForm<RegisterFormValues>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: valibotResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: Role.LeaderDisaster,
    },
  });

  const loginForm = useForm<LoginFormValues>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: valibotResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const form = isRegister ? registerForm : loginForm;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = form;

  const buttonLabel =
    submitLabel ?? (isRegister ? 'Crear cuenta' : 'Iniciar sesión');

  return (
    <form className={className} noValidate onSubmit={handleSubmit(onSubmit)}>
      {isRegister && (
        <div>
          <label htmlFor="fullName">Nombre completo</label>
          <input
            id="fullName"
            type="text"
            {...register('fullName')}
            aria-invalid={Boolean(errors.fullName)}
            placeholder="Ana García"
          />
          {errors.fullName && (
            <p role="alert">{String(errors.fullName.message)}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
          placeholder="lider@abasto.org"
        />
        {errors.email && <p role="alert">{String(errors.email.message)}</p>}
      </div>

      <div>
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
          placeholder="••••••••"
        />
        {errors.password && (
          <p role="alert">{String(errors.password.message)}</p>
        )}
      </div>

      {isRegister && (
        <div>
          <label htmlFor="role">Rol</label>
          <select
            id="role"
            {...register('role')}
            aria-invalid={Boolean(errors.role)}
          >
            <option value={Role.LeaderDisaster}>
              Líder de zona de desastre
            </option>
            <option value={Role.LeaderCollection}>
              Líder de zona de recolección
            </option>
          </select>
          {errors.role && <p role="alert">{String(errors.role.message)}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={isBusy || isSubmitting || !isDirty || !isValid}
      >
        {buttonLabel}
      </button>
    </form>
  );
}

export default AuthForm;
