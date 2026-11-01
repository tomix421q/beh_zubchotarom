const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

// Failed login timestamps per client IP, kept in memory; a restart clears them
const failedAttempts = new Map<string, number[]>();

function recentFailures(ip: string, now: number): number[] {
	return (failedAttempts.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
}

export function isLoginBlocked(ip: string, now: number): boolean {
	return recentFailures(ip, now).length >= MAX_FAILED_ATTEMPTS;
}

export function recordFailedLogin(ip: string, now: number): void {
	// Drop IPs whose failures have all expired so the map doesn't grow forever
	for (const [key, times] of failedAttempts) {
		if (times.every((time) => now - time >= WINDOW_MS)) failedAttempts.delete(key);
	}

	failedAttempts.set(ip, [...recentFailures(ip, now), now]);
}
