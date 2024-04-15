import { RequestWithUser } from './types';

export const getClientIp = (req: RequestWithUser): string | null => {
  // Check for the 'x-forwarded-for' header in case of proxy.
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    // 'x-forwarded-for' may contain multiple IPs, separated by a comma. The first one is the original client
    const ips = forwardedFor.split(',');
    return ips[0];
  }

  // If application is not behind a proxy, get connection remote address
  // NOTE: This may not return the correct IP if your app is behind a proxy or load balancer.
  return req.socket.remoteAddress || null;
};
