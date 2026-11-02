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

<!-- The page container gives the same width as the cards above, so the marquee does not run the full window -->
{#if sponsors.length > 0}
	<footer class="pageContainer mt-12 pb-8 lg:mt-24">
		<section class="glassCard flex flex-col gap-6 p-6">
			<h2 class="text-center text-lg font-semibold tracking-wider text-foreground">
				Sponzori a podporili nás
			</h2>
			<SponsorMarquee rows={sponsorRows} />
		</section>
	</footer>
{/if}
