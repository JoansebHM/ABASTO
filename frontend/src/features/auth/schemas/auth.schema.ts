import * as v from 'valibot';
import { Role } from '@/lib/domain';

const emailSchema = v.pipe(
  v.string('Email es obligatorio.'),
  v.trim(),
  v.email('Debe ingresar un email válido.')
);

const passwordSchema = v.pipe(
  v.string('La contraseña es obligatoria.'),
  v.minLength(8, 'La contraseña debe tener al menos 8 caracteres.'),
  v.regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula.'),
  v.regex(/[a-z]/, 'La contraseña debe incluir al menos una minúscula.'),
  v.regex(/[0-9]/, 'La contraseña debe incluir al menos un número.')
);

const fullNameSchema = v.pipe(
  v.string('El nombre completo es obligatorio.'),
  v.trim(),
  v.minLength(2, 'El nombre completo debe tener al menos 2 caracteres.'),
  v.maxLength(100, 'El nombre completo no puede superar 100 caracteres.')
);

export const registerSchema = v.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: v.picklist([Role.LeaderDisaster, Role.LeaderCollection]),
});

export const loginSchema = v.object({
  email: emailSchema,
  password: passwordSchema,
});

export const authSchema = registerSchema;

export type RegisterFormValues = v.InferInput<typeof registerSchema>;
export type LoginFormValues = v.InferInput<typeof loginSchema>;
export type AuthFormValues = v.InferInput<typeof authSchema>;
