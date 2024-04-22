import { z } from 'zod';
import { passwordDto } from 'src/common/dto/password.dto';

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    token: z.string(),
    password: passwordDto,
    confirmPassword: z.string(),
  })
  .required()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Your passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
