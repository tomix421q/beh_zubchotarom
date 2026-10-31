import { describe, expect, it } from 'vitest';
import { formatEventDate, getCountdown } from './dateUtils';

describe('formatEventDate', () => {
	it('formats the event date in Slovak long form in Bratislava time', () => {
		expect(formatEventDate(new Date('2026-06-06T00:00:00Z'))).toBe('6. júna 2026');
	});
});

describe('getCountdown', () => {
	it('splits the time left until the event into days, hours, minutes and seconds', () => {
		const countdown = getCountdown(
			new Date('2026-06-06T00:00:00Z'),
			new Date('2026-06-01T12:30:15Z')
		);

		expect(countdown).toEqual({ days: 4, hours: 11, minutes: 29, seconds: 45 });
	});

	it('returns zeros once the event has already started', () => {
		const countdown = getCountdown(
			new Date('2026-06-06T00:00:00Z'),
			new Date('2026-06-07T08:00:00Z')
		);

		expect(countdown).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
	});
});
