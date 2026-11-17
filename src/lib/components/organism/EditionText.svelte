<script lang="ts">
	let { infoHtml }: { infoHtml: string | null } = $props();
</script>

{#if infoHtml}
	<section class="glassCard p-6">
		<!-- The wide column uses the card on large screens; infoHtml is sanitized on the server before it reaches the page -->
		<div class="mx-auto prose max-w-4xl text-foreground prose-invert">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html infoHtml}
		</div>
	</section>
{/if}
