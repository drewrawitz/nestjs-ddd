import { z } from 'zod';

export const passwordDto = z.string().min(8).max(100);
