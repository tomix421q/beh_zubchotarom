import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { error } from '@sveltejs/kit';
import { ADMIN_PASSWORD, ADMIN_SESSION_SECRET } from '$app/env/private';

export const ADMIN_COOKIE = 'admin_session';
export const SESSION_SECONDS = 8 * 60 * 60;

// Every admin load and action calls this, the UI check alone is not enough
export function requireAdmin(locals: App.Locals): void {
	if (!locals.isAdmin) error(404, 'Stránka sa nenašla.');
}

function requireSecret(): string {
	if (!ADMIN_SESSION_SECRET) throw new Error('ADMIN_SESSION_SECRET is not set');
	return ADMIN_SESSION_SECRET;
}

function sign(expiresAt: number): string {
	return createHmac('sha256', requireSecret()).update(String(expiresAt)).digest('hex');
}

// Hashing both sides gives equal-length inputs, so timingSafeEqual can compare any two strings
function sameText(a: string, b: string): boolean {
	const digest = (text: string) => createHash('sha256').update(text).digest();
	return timingSafeEqual(digest(a), digest(b));
}

export function isPasswordValid(input: string): boolean {
	return !!ADMIN_PASSWORD && sameText(input, ADMIN_PASSWORD);
}

// Token format: "<expiresAt in ms>.<HMAC of expiresAt>"
export function createSessionToken(now: number): string {
	const expiresAt = now + SESSION_SECONDS * 1000;
	return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidSessionToken(token: string | undefined, now: number): boolean {
	if (!token || !ADMIN_SESSION_SECRET) return false;

	const [expiresAt, signature = ''] = token.split('.');
	const expiry = Number(expiresAt);

	return expiry > now && sameText(signature, sign(expiry));
}
