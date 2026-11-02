<script lang="ts">
	import type { Sponsor } from '../../generated/prisma/client';
	import SponsorMarquee from './SponsorMarquee.svelte';

	let { sponsors }: { sponsors: Sponsor[] } = $props();

	// Each sponsor row keeps the order set in the admin, the sponsors are already sorted
	const sponsorRows = $derived([
		sponsors.filter((sponsor) => sponsor.row === 'top'),
		sponsors.filter((sponsor) => sponsor.row === 'bottom')
	]);
</script>

{#if sponsors.length > 0}
	<footer class="border-t border-border bg-card py-4 backdrop-blur-md">
		<SponsorMarquee rows={sponsorRows} />
	</footer>
{/if}
