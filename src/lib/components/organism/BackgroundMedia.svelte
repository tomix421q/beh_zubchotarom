<script lang="ts">
	let { videoUrl, imageUrl }: { videoUrl: string | null; imageUrl: string } = $props();

	// How long the video gets to become playable; after that the image stays and the video is dropped
	const LOAD_TIMEOUT_MS = 3000;
	// HTMLMediaElement.HAVE_ENOUGH_DATA: the browser expects to play to the end without stalling
	const HAVE_ENOUGH_DATA = 4;

	// 'loading' covers the page with a loader, 'playing' shows the video, 'image' shows only the image.
	// Without a video there is nothing to wait for
	// The layout remounts this component when the video changes, so the initial value is enough
	// svelte-ignore state_referenced_locally
	let status = $state<'loading' | 'playing' | 'image'>(videoUrl ? 'loading' : 'image');
	let video: HTMLVideoElement | undefined = $state();

	function showImage() {
		status = 'image';

		// Emptying the source stops the download of a video that is no longer going to play
		if (video) {
			video.removeAttribute('src');
			video.load();
		}
	}

	$effect(() => {
		if (!video || status !== 'loading') return;

		const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
			.connection;
		const skipVideo =
			window.matchMedia('(prefers-reduced-motion: reduce)').matches || connection?.saveData;
		if (skipVideo) return showImage();

		const timer = setTimeout(showImage, LOAD_TIMEOUT_MS);

		// The video starts only when it can play to the end, so the runner does not stutter
		async function start() {
			if (!video || status !== 'loading') return;
			clearTimeout(timer);

			try {
				await video.play();
				status = 'playing';
			} catch {
				// Autoplay can still be refused, for example in a low power mode
				showImage();
			}
		}

		// The video may have been ready before this ran, so the event alone could already be missed
		if (video.readyState >= HAVE_ENOUGH_DATA) start();
		else video.addEventListener('canplaythrough', start, { once: true });

		return () => {
			clearTimeout(timer);
			video?.removeEventListener('canplaythrough', start);
		};
	});
</script>

<svelte:head>
	<!-- Without JavaScript the loader could never be removed -->
	<noscript
		><style>
			.backgroundLoader {
				display: none;
			}
		</style></noscript
	>
</svelte:head>

<div class="fixed inset-0 -z-10">
	<img src={imageUrl} alt="" class="absolute inset-0 size-full object-cover" />

	{#if videoUrl && status !== 'image'}
		<!-- The video is a decoration with no sound, so it has no controls or captions -->
		<video
			bind:this={video}
			src={videoUrl}
			muted
			playsinline
			preload="auto"
			aria-hidden="true"
			class={[
				'absolute inset-0 size-full object-cover transition-opacity duration-500',
				status === 'playing' ? 'opacity-100' : 'opacity-0'
			]}
		></video>
	{/if}
</div>

{#if videoUrl}
	<div
		role="status"
		aria-hidden={status !== 'loading'}
		class={[
			'backgroundLoader dark fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 motion-reduce:hidden',
			status === 'loading' ? 'opacity-100' : 'pointer-events-none opacity-0'
		]}
	>
		<span class="sr-only">Načítavam stránku</span>
		<span
			class="size-10 animate-spin rounded-full border-4 border-muted-foreground/30 border-t-primary"
		></span>
	</div>
{/if}
