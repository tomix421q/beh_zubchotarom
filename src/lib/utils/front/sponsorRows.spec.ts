import { describe, expect, it } from 'vitest';
import { splitIntoRows } from './sponsorRows';

describe('splitIntoRows', () => {
	it('alternates items between the first and the second row', () => {
		expect(splitIntoRows(['a', 'b', 'c', 'd', 'e'])).toEqual([
			['a', 'c', 'e'],
			['b', 'd']
		]);
	});

	it('leaves the second row empty for a single sponsor', () => {
		expect(splitIntoRows(['a'])).toEqual([['a'], []]);
	});
});
