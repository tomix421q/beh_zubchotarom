<script lang="ts">
	import { cn } from '#lib/utils/ui.js';

	// url must come from parseMapEmbedUrl, so only Google Maps is ever framed
	let { url, title, class: className }: { url: string; title: string; class?: string } = $props();
</script>

<iframe
	src={url}
	{title}
	loading="lazy"
	referrerpolicy="no-referrer-when-downgrade"
	sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
	allowfullscreen
	class={cn('aspect-video w-full rounded-xl border border-border', className)}
></iframe>
