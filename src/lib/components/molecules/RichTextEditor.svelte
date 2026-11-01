<script lang="ts" module>
	import { Mark, mergeAttributes } from '@tiptap/core';

	// The only colour the editor allows: a "notice" span, styled by .notice in layout.css
	const Notice = Mark.create({
		name: 'notice',
		parseHTML: () => [{ tag: 'span.notice' }],
		renderHTML: ({ HTMLAttributes }) => [
			'span',
			mergeAttributes(HTMLAttributes, { class: 'notice' })
		]
	});
</script>

<script lang="ts">
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { untrack } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';

	let { name, value = '' }: { name: string; value?: string } = $props();

	let element: HTMLDivElement | undefined = $state();
	let editor: Editor | undefined = $state();
	let html = $state(untrack(() => value));

	// The editor is created once the element exists and destroyed on leave, so no listeners are left behind
	$effect(() => {
		if (!element) return;

		const instance = new Editor({
			element,
			extensions: [StarterKit, Notice],
			content: untrack(() => value),
			editorProps: {
				attributes: {
					class:
						'prose prose-invert max-w-none min-h-40 px-4 py-3 text-foreground focus:outline-none'
				}
			},
			onUpdate: () => (html = instance.getHTML())
		});

		editor = instance;
		return () => instance.destroy();
	});

	function setLink(instance: Editor) {
		const href = window.prompt('Adresa odkazu (napr. google.com)');
		if (href === null) return;

		const url = href.trim();
		if (url === '') instance.chain().focus().unsetLink().run();
		else {
			// Without a scheme the browser treats "google.com" as a path on this site, so https is added
			const absolute = /^(https?:|mailto:)/i.test(url) ? url : `https://${url}`;
			instance.chain().focus().extendMarkRange('link').setLink({ href: absolute }).run();
		}
	}

	const tools: { label: string; run: (instance: Editor) => void }[] = [
		{
			label: 'Nadpis',
			run: (instance) => instance.chain().focus().toggleHeading({ level: 2 }).run()
		},
		{
			label: 'Podnadpis',
			run: (instance) => instance.chain().focus().toggleHeading({ level: 3 }).run()
		},
		{ label: 'Tučné', run: (instance) => instance.chain().focus().toggleBold().run() },
		{ label: 'Odrážky', run: (instance) => instance.chain().focus().toggleBulletList().run() },
		{ label: 'Číslovanie', run: (instance) => instance.chain().focus().toggleOrderedList().run() },
		{ label: 'Odkaz', run: setLink },
		{ label: 'Upozornenie', run: (instance) => instance.chain().focus().toggleMark('notice').run() }
	];
</script>

<div class="overflow-hidden rounded-lg border border-border">
	<div
		class="flex flex-wrap gap-1 border-b border-border p-2"
		role="toolbar"
		aria-label="Formátovanie"
	>
		{#each tools as tool (tool.label)}
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={!editor}
				onclick={() => editor && tool.run(editor)}
			>
				{tool.label}
			</Button>
		{/each}
	</div>

	<div bind:this={element}></div>

	<!-- The editor's HTML goes to the server through this field; the server sanitizes it before saving -->
	<input type="hidden" {name} value={html} />
</div>
