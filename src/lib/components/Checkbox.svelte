<script lang="ts">
	import Check from '$lib/icons/Check.svelte';
	import { v4 as uuidv4 } from 'uuid';

	let id = uuidv4();
	let {
		text,
		checked = false,
		className,
		onClickHandler
	}: {
		text?: string;
		checked?: boolean;
		className?: string;
		onClickHandler?: () => void;
	} = $props();
</script>

<label
	for={id}
	class="size-5 relative flex cursor-pointer items-center justify-center rounded border {className} {checked
		? ' border-pink-500 bg-pink-500'
		: ' border-slate-300 bg-white'}"
>
	<Check
		className="absolute top-0.25 left-0.25 size-4 {checked ? 'fill-white' : 'fill-transparent'}"
	/>
</label>

{#if text}
	<label for={id}> {text}</label>
{/if}

<input {id} type="checkbox" class="hidden" bind:checked />
