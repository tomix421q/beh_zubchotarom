import type { Handle } from '@sveltejs/kit/hooks';
import { ADMIN_COOKIE, isValidSessionToken } from './lib/server/auth';

// Pages and actions read locals.isAdmin; the cookie itself is only trusted after its signature is checked
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.isAdmin = isValidSessionToken(event.cookies.get(ADMIN_COOKIE), Date.now());

	return resolve(event);
};
