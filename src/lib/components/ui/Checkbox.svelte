<script lang="ts">
	// Utilities
	import { v4 as uuidv4 } from 'uuid';

	// Icons
	import Check from '$lib/icons/Check.svelte';

	// Properties
	let {
		text,
		textPosition = 'right',
		labelClasses,
		checked = false,
		checkboxClasses,
		onChange
	}: {
		text?: string; // Checkbox label
		textPosition?: 'left' | 'right'; // Label position relative to the checkbox
		labelClasses?: string; // Additionnal classes to apply to the label
		checked?: boolean; // Checked status
		checkboxClasses?: string; // Additional classes to apply to the checkbox
		onChange?: () => void;
	} = $props(); // Fire an event when the status changes

	// Generate a random id to associate the label to the input
	const id = uuidv4();
</script>

{#if text && textPosition === 'left'}
	<label for={id} class="cursor-pointer {labelClasses}"> {text}</label>
{/if}

<label
	for={id}
	class="relative flex size-5 cursor-pointer items-center justify-center rounded border {checkboxClasses} {checked
		? ' border-linagora-500 bg-linagora-500'
		: ' border-slate-300 bg-white'}"
>
	<Check
		className="absolute top-0.25 left-0.25 size-4 {checked ? 'fill-white' : 'fill-transparent'}"
	/>
</label>

{#if text && textPosition === 'right'}
	<label for={id} class="cursor-pointer {labelClasses}"> {text}</label>
{/if}

<input {id} type="checkbox" class="hidden" bind:checked onchange={onChange} />
