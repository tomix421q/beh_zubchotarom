import { describe, expect, it } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
	it('returns every item exactly once and leaves the input untouched', () => {
		const input = ['a', 'b', 'c', 'd'];

		const result = shuffle(input);

		expect([...result].sort()).toEqual(['a', 'b', 'c', 'd']);
		expect(input).toEqual(['a', 'b', 'c', 'd']);
	});

	it('picks positions from the injected random source', () => {
		expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
	});
});
