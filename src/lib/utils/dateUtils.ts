const eventDateFormatter = new Intl.DateTimeFormat('sk-SK', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'Europe/Bratislava'
});

// sv-SE renders ISO-style YYYY-MM-DD, so the keys compare chronologically as strings
const dayKeyFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Bratislava' });

export function formatEventDate(date: Date): string {
	return eventDateFormatter.format(date);
}

export function getDayKey(date: Date): string {
	return dayKeyFormatter.format(date);
}

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const wallClockFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: 'Europe/Bratislava',
	hourCycle: 'h23',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit'
});

// Bratislava wall-clock time for an instant, returned as if it were UTC
function bratislavaWallClock(time: number): number {
	const parts = Object.fromEntries(
		wallClockFormatter.formatToParts(time).map(({ type, value }) => [type, Number(value)])
	);

	return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

function bratislavaOffset(time: number): number {
	return bratislavaWallClock(time) - time;
}

// Reads a datetime-local value ("2026-06-13T10:00") as Bratislava time and returns the matching instant
export function parseBratislavaDateTime(value: string): Date {
	const wallClock = Date.parse(`${value}Z`);
	if (Number.isNaN(wallClock)) return new Date(NaN);

	// Two passes, so the offset is right on both sides of the daylight saving switch
	const firstGuess = wallClock - bratislavaOffset(wallClock);

	return new Date(wallClock - bratislavaOffset(firstGuess));
}

// Inverse of parseBratislavaDateTime: the value a datetime-local input shows for this date
export function formatBratislavaDateTime(date: Date): string {
	return new Date(bratislavaWallClock(date.getTime())).toISOString().slice(0, 16);
}

export function getCountdown(eventDate: Date, now: Date) {
	let remaining = Math.max(eventDate.getTime() - now.getTime(), 0);

	const days = Math.floor(remaining / MS_PER_DAY);
	remaining %= MS_PER_DAY;
	const hours = Math.floor(remaining / MS_PER_HOUR);
	remaining %= MS_PER_HOUR;
	const minutes = Math.floor(remaining / MS_PER_MINUTE);
	remaining %= MS_PER_MINUTE;
	const seconds = Math.floor(remaining / MS_PER_SECOND);

	return { days, hours, minutes, seconds };
}
