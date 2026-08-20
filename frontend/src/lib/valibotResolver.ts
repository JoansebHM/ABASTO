import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';

import * as v from 'valibot';

export function valibotResolver<TFieldValues extends FieldValues = FieldValues>(
  schema: v.GenericSchema
): Resolver<TFieldValues> {
  return async (values) => {
    const result = v.safeParse(schema, values);

    if (result.success) {
      return {
        values: result.output as TFieldValues,
        errors: {},
      };
    }

    const errors: FieldErrors<TFieldValues> = {};

    for (const issue of result.issues) {
      const key = issue.path?.[0]?.key;

      if (key === undefined) {
        continue;
      }

      errors[String(key)] = {
        type: issue.type,
        message: issue.message,
      };
    }

    return {
      values: {},
      errors,
    };
  };
}

export default valibotResolver;
