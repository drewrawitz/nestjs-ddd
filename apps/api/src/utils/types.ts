import { FastifyRequest } from 'fastify';

export interface FastifyRequestWithUser extends FastifyRequest {
  user: any;
}
