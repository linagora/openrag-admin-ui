<script lang="ts">
	import Check from '$lib/icons/Check.svelte';
	import { v4 as uuidv4 } from 'uuid';

	let id = uuidv4();
	let {
		text,
		textPosition = 'right',
		textClass,
		checked = false,
		className,
		onChange
	}: {
		text?: string;
		textPosition?: 'left' | 'right';
		textClass?: string;
		checked?: boolean;
		className?: string;
		onChange?: () => void;
	} = $props();
</script>

{#if text && textPosition === 'left'}
	<label for={id} class="cursor-pointer {textClass}"> {text}</label>
{/if}

<label
	for={id}
	class="relative flex size-5 cursor-pointer items-center justify-center rounded border {className} {checked
		? ' border-pink-500 bg-pink-500'
		: ' border-slate-300 bg-white'}"
>
	<Check
		className="absolute top-0.25 left-0.25 size-4 {checked ? 'fill-white' : 'fill-transparent'}"
	/>
</label>

{#if text && textPosition === 'right'}
	<label for={id} class="cursor-pointer {textClass}"> {text}</label>
{/if}

<input {id} type="checkbox" class="hidden" bind:checked onchange={onChange} />
