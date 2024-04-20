export const publicRoutes = ['/'];

/**
 * Array of routes that are used for authentication.
 */
export const authRoutes = ['/auth/login', '/auth/register'];

/**
 * Prefix of the routes that are used for authentication. These will call the API authentication,
 * which is always needed to be public.
 */
export const authApiPrefix = '/api/auth';

export const DEFAULT_LOGIN_REDIRECT = '/settings';
