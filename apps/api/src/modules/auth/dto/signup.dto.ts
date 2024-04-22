import { z } from 'zod';
import { passwordDto } from 'src/common/dto/password.dto';

export const signupSchema = z
  .object({
    email: z.string().email(),
    password: passwordDto,
    firstName: z.string(),
    lastName: z.string(),
  })
  .required();

export type SignupDto = z.infer<typeof signupSchema>;
