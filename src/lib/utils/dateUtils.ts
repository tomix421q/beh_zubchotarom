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
