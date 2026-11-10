<script lang="ts" module>
	import { Mark, mergeAttributes } from '@tiptap/core';
	import Image from '@tiptap/extension-image';

	// The editor offers a fixed set of text colours; each is a class styled by a token in layout.css,
	// so stored texts follow the theme and never carry inline styles
	const TEXT_COLORS = [
		{ value: 'red', label: 'Červená', className: 'textRed' },
		{ value: 'yellow', label: 'Žltá', className: 'textYellow' },
		{ value: 'green', label: 'Zelená', className: 'textGreen' },
		{ value: 'gray', label: 'Sivá', className: 'textGray' }
	] as const;

	const TextColor = Mark.create({
		name: 'textColor',
		addAttributes: () => ({ color: { default: 'red', rendered: false } }),
		parseHTML: () => [
			// The older "notice" style was red, so stored texts open with the red colour
			{ tag: 'span.notice', attrs: { color: 'red' } },
			...TEXT_COLORS.map((color) => ({
				tag: `span.${color.className}`,
				attrs: { color: color.value }
			}))
		],
		renderHTML: ({ HTMLAttributes, mark }) => {
			const color = TEXT_COLORS.find((item) => item.value === mark.attrs.color) ?? TEXT_COLORS[0];
			return ['span', mergeAttributes(HTMLAttributes, { class: color.className }), 0];
		}
	});

	// Images take the full width, or float left or right of the text on wider screens
	const IMAGE_ALIGNS = [
		{ value: 'full', label: 'Celá šírka', className: 'imgFull' },
		{ value: 'left', label: 'Vľavo', className: 'imgLeft' },
		{ value: 'right', label: 'Vpravo', className: 'imgRight' }
	] as const;

	const AlignedImage = Image.extend({
		addAttributes() {
			return {
				src: { default: null },
				alt: { default: '' },
				align: {
					default: 'full',
					parseHTML: (element: HTMLElement) =>
						IMAGE_ALIGNS.find((align) => element.classList.contains(align.className))?.value ??
						'full',
					renderHTML: (attributes: { align?: string }) => ({
						class: (
							IMAGE_ALIGNS.find((align) => align.value === attributes.align) ?? IMAGE_ALIGNS[0]
						).className
					})
				}
			};
		}
	}).configure({ inline: false, allowBase64: false });
</script>

<script lang="ts">
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { TableKit } from '@tiptap/extension-table';
	import {
		Bold,
		Eraser,
		Heading2,
		Heading3,
		ImagePlus,
		Link,
		List,
		ListOrdered,
		Table
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import { untrack } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';

	let { name, value = '' }: { name: string; value?: string } = $props();

	let element: HTMLDivElement | undefined = $state();
	let fileInput: HTMLInputElement | undefined = $state();
	let editor: Editor | undefined = $state();
	let html = $state(untrack(() => value));
	let uploading = $state(false);
	let uploadError = $state('');
	// Tiptap state is not reactive; bumping this after each transaction refreshes the active buttons
	let revision = $state(0);

	// The editor is created once the element exists and destroyed on leave, so no listeners are left behind
	$effect(() => {
		if (!element) return;

		const instance = new Editor({
			element,
			extensions: [
				StarterKit,
				TextColor,
				AlignedImage,
				TableKit.configure({ table: { resizable: false } })
			],
			content: untrack(() => value),
			editorProps: {
				attributes: {
					class:
						'prose prose-invert max-w-none min-h-40 px-4 py-3 text-foreground focus:outline-none'
				}
			},
			onUpdate: () => (html = instance.getHTML()),
			onTransaction: () => revision++
		});

		editor = instance;
		return () => instance.destroy();
	});

	function isActive(nameOrAttributes: string, attributes?: Record<string, unknown>): boolean {
		void revision;
		return editor?.isActive(nameOrAttributes, attributes) ?? false;
	}

	const inTable = $derived.by(() => {
		void revision;
		return editor?.isActive('table') ?? false;
	});

	const imageSelected = $derived.by(() => {
		void revision;
		return editor?.isActive('image') ?? false;
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

	// The description is required (accessibility and search engines). It is asked before the upload,
	// so cancelling leaves no file on the server. Null means the admin cancelled
	function askImageAlt(current = ''): string | null {
		let message = 'Popis obrázka (povinné), napr. „Štart hlavnej trate“';

		for (;;) {
			const answer = window.prompt(message, current);
			if (answer === null) return null;
			if (answer.trim()) return answer.trim();
			message = 'Popis nesmie byť prázdny. Krátko opíšte, čo je na obrázku.';
		}
	}

	// The file is uploaded once it has a description; the text keeps only its address
	async function uploadImage(file: File) {
		if (!editor) return;

		const alt = askImageAlt();
		if (alt === null) return;

		uploading = true;
		uploadError = '';

		try {
			const body = new FormData();
			body.append('file', file);
			const response = await fetch('/admin/obrazky', { method: 'POST', body });
			const result: { url?: string; message?: string } = await response.json().catch(() => ({}));

			if (!response.ok || !result.url) {
				uploadError = result.message ?? 'Obrázok sa nepodarilo nahrať. Skúste sa znova prihlásiť.';
				return;
			}

			editor.chain().focus().setImage({ src: result.url, alt }).run();
		} catch {
			uploadError = 'Obrázok sa nepodarilo nahrať. Skontrolujte pripojenie.';
		} finally {
			uploading = false;
		}
	}

	function onFilePicked(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0];
		// Cleared so picking the same file again still triggers a change
		event.currentTarget.value = '';
		if (file) uploadImage(file);
	}

	function editImageAlt(instance: Editor) {
		const alt = askImageAlt(String(instance.getAttributes('image').alt ?? ''));
		if (alt !== null) instance.chain().focus().updateAttributes('image', { alt }).run();
	}

	type Tool = {
		label: string;
		icon: Component;
		run: (instance: Editor) => void;
		active?: () => boolean;
	};

	const toolGroups: Tool[][] = [
		[
			{
				label: 'Nadpis',
				icon: Heading2,
				run: (instance) => instance.chain().focus().toggleHeading({ level: 2 }).run(),
				active: () => isActive('heading', { level: 2 })
			},
			{
				label: 'Podnadpis',
				icon: Heading3,
				run: (instance) => instance.chain().focus().toggleHeading({ level: 3 }).run(),
				active: () => isActive('heading', { level: 3 })
			}
		],
		[
			{
				label: 'Tučné',
				icon: Bold,
				run: (instance) => instance.chain().focus().toggleBold().run(),
				active: () => isActive('bold')
			}
		],
		[
			{
				label: 'Odrážky',
				icon: List,
				run: (instance) => instance.chain().focus().toggleBulletList().run(),
				active: () => isActive('bulletList')
			},
			{
				label: 'Číslovanie',
				icon: ListOrdered,
				run: (instance) => instance.chain().focus().toggleOrderedList().run(),
				active: () => isActive('orderedList')
			}
		],
		[
			{ label: 'Odkaz', icon: Link, run: setLink, active: () => isActive('link') },
			{ label: 'Obrázok', icon: ImagePlus, run: () => fileInput?.click() },
			{
				label: 'Tabuľka',
				icon: Table,
				run: (instance) =>
					instance.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()
			}
		]
	];

	const tableTools: { label: string; run: (instance: Editor) => void }[] = [
		{ label: '+ Riadok', run: (instance) => instance.chain().focus().addRowAfter().run() },
		{ label: '− Riadok', run: (instance) => instance.chain().focus().deleteRow().run() },
		{ label: '+ Stĺpec', run: (instance) => instance.chain().focus().addColumnAfter().run() },
		{ label: '− Stĺpec', run: (instance) => instance.chain().focus().deleteColumn().run() },
		{ label: 'Hlavička', run: (instance) => instance.chain().focus().toggleHeaderRow().run() },
		{ label: 'Zmazať tabuľku', run: (instance) => instance.chain().focus().deleteTable().run() }
	];
</script>

<div class="overflow-hidden rounded-lg border border-border">
	<div class="border-b border-border p-2" role="toolbar" aria-label="Formátovanie">
		<div class="flex flex-wrap items-center gap-1">
			{#each toolGroups as group, index (index)}
				{#if index > 0}
					<span class="mx-1 h-5 w-px bg-border" aria-hidden="true"></span>
				{/if}
				{#each group as tool (tool.label)}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						title={tool.label}
						aria-label={tool.label}
						aria-pressed={tool.active ? tool.active() : undefined}
						class={tool.active?.() ? 'bg-accent text-foreground' : ''}
						disabled={!editor || (tool.label === 'Obrázok' && uploading)}
						onclick={() => editor && tool.run(editor)}
					>
						<tool.icon />
					</Button>
				{/each}
			{/each}

			<span class="mx-1 h-5 w-px bg-border" aria-hidden="true"></span>
			<!-- Colour swatches: each one paints the selected text with its class -->
			{#each TEXT_COLORS as color (color.value)}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					title={color.label}
					aria-label={`Farba: ${color.label}`}
					aria-pressed={isActive('textColor', { color: color.value })}
					class={isActive('textColor', { color: color.value }) ? 'bg-accent' : ''}
					disabled={!editor}
					onclick={() => editor?.chain().focus().setMark('textColor', { color: color.value }).run()}
				>
					<span class="{color.className} text-base leading-none font-bold">A</span>
				</Button>
			{/each}
			<Button
				type="button"
				variant="ghost"
				size="icon"
				title="Bez farby"
				aria-label="Bez farby"
				disabled={!editor}
				onclick={() => editor?.chain().focus().unsetMark('textColor').run()}
			>
				<Eraser />
			</Button>
		</div>

		{#if editor && imageSelected}
			<div class="mt-2 flex flex-wrap gap-1 border-t border-border pt-2">
				{#each IMAGE_ALIGNS as align (align.value)}
					<Button
						type="button"
						variant={isActive('image', { align: align.value }) ? 'secondary' : 'outline'}
						size="sm"
						onclick={() =>
							editor?.chain().focus().updateAttributes('image', { align: align.value }).run()}
					>
						{align.label}
					</Button>
				{/each}
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={() => editor && editImageAlt(editor)}
				>
					Popis
				</Button>
				<Button
					type="button"
					variant="destructive"
					size="sm"
					onclick={() => editor?.chain().focus().deleteSelection().run()}
				>
					Odstrániť obrázok
				</Button>
			</div>
		{:else if editor && inTable}
			<div class="mt-2 flex flex-wrap gap-1 border-t border-border pt-2">
				{#each tableTools as tool (tool.label)}
					<Button
						type="button"
						variant={tool.label === 'Zmazať tabuľku' ? 'destructive' : 'outline'}
						size="sm"
						onclick={() => editor && tool.run(editor)}
					>
						{tool.label}
					</Button>
				{/each}
			</div>
		{/if}

		{#if uploading}
			<p class="mt-2 text-sm text-muted-foreground">Nahrávam obrázok…</p>
		{/if}
		{#if uploadError}
			<p class="mt-2 text-sm text-destructive" role="alert">{uploadError}</p>
		{/if}
	</div>

	<div bind:this={element}></div>

	<input
		bind:this={fileInput}
		type="file"
		accept="image/jpeg,image/png,image/webp,image/avif"
		class="hidden"
		onchange={onFilePicked}
	/>

	<!-- The editor's HTML goes to the server through this field; the server sanitizes it before saving -->
	<input type="hidden" {name} value={html} />
</div>
