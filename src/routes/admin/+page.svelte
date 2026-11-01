<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { SITE_NAME } from '../../lib/constants';
</script>

<svelte:head>
	<title>Administrácia · {SITE_NAME}</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between gap-4">
		<h1 class="text-2xl font-bold">Administrácia</h1>

		<form method="POST" action="?/logout">
			<Button type="submit" variant="outline">Odhlásiť sa</Button>
		</form>
	</div>
</div>
