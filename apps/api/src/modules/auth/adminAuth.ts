import type { NextFunction, Request, Response } from 'express';

import { env } from '../../config/env.js';
import { safeEqual, toBasicAuthCredentials } from '../../lib/http.js';

export function requireAdminAuth(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const credentials = toBasicAuthCredentials(request.header('authorization'));

  if (
    !credentials ||
    !safeEqual(credentials.username, env.ADMIN_USERNAME) ||
    !safeEqual(credentials.password, env.ADMIN_PASSWORD)
  ) {
    response.setHeader('WWW-Authenticate', 'Basic realm="admin"');
    response.status(401).json({ message: 'Authentication required' });
    return;
  }

  next();
}
