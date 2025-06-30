<script lang="ts">
	// Utilities
	import { v4 as uuidv4 } from 'uuid';

	// Icons
	import Check from '$lib/icons/Check.svelte';

	// Export types
	export type TernaryCheckboxStatus = 'full' | 'partial' | 'none';

	// Properties
	let {
		label: text,
		textPosition = 'right',
		labelClasses,
		checked = 'none',
		checkboxClasses,
		onChange
	}: {
		label?: string; // Checkbox label
		textPosition?: 'left' | 'right'; // Label position relative to the checkbox
		labelClasses?: string; // Additionnal classes to apply to the label
		checked?: TernaryCheckboxStatus; // Checked status
		checkboxClasses?: string; // Additional classes to apply to the checkbox
		onChange?: (value: TernaryCheckboxStatus) => void; // Fire an event when the status changes
	} = $props();

	// Generate a random id to associate the label to the input
	const id = uuidv4();

	/**
	 * Toggles the checkbox and fires an event.
	 * When in partial or in none state, clicking should select everything (full)
	 * When in full state, clicking should unselect everything (none)
	 */
	const toggleCheckbox = () => {
		if (checked === 'partial' || checked === 'none') {
			checked = 'full';
		} else if (checked === 'full') {
			checked = 'none';
		}

		if (onChange) {
			onChange(checked);
		}
	};

	/**
	 * Toggles the checkbox when pressing the Enter key
	 * @param event
	 */
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			toggleCheckbox();
		}
	};
</script>

{#if text && textPosition === 'left'}
	<label for={id} class="cursor-pointer {labelClasses}"> {text}</label>
{/if}

<div
	{id}
	role="checkbox"
	aria-checked={checked === 'full' ? 'true' : checked === 'partial' ? 'mixed' : 'false'}
	tabindex="0"
	onclick={toggleCheckbox}
	onkeydown={handleKeydown}
	class="relative flex size-5 cursor-pointer items-center justify-center rounded border {checkboxClasses} {checked !==
	'none'
		? 'border-linagora-500 bg-linagora-500'
		: 'border-slate-300 bg-white'}"
>
	{#if checked === 'partial'}
		<div class="absolute inset-1 rounded-sm bg-white"></div>
	{:else if checked === 'full'}
		<Check className="absolute top-0.25 left-0.25 size-4 fill-white" />
	{/if}
</div>

{#if text && textPosition === 'right'}
	<label for={id} class="cursor-pointer {labelClasses}"> {text}</label>
{/if}
