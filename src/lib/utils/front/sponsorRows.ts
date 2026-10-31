// Even positions go to the first row and odd positions to the second, so the rows stay balanced
export function splitIntoRows<T>(items: T[]): [T[], T[]] {
	const firstRow = items.filter((_, index) => index % 2 === 0);
	const secondRow = items.filter((_, index) => index % 2 === 1);

	return [firstRow, secondRow];
}
