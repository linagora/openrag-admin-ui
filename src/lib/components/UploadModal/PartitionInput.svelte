<script lang="ts">
	// Stores
	import { partitions } from '$lib/stores';

	// Types
	import type { RagondinPartition } from '$lib/types';

	// Properties
	let {
		selectedPartition = $bindable(),
		onSelect
	}: {
		selectedPartition?: RagondinPartition | null; // The input's selected partition
		onSelect?: (partition: RagondinPartition) => void; // Event to fire when a partition is selected
	} = $props();

	// UI Properties
	let searchFilter: string = $state('');

	// Select a partition and fire onSelect when a partition is selected
	const selectPartition = (partition: RagondinPartition) => {
		selectedPartition = partition;
		if (onSelect) onSelect(partition);
	};

	// Locally sets a selected partition when a new one should be created
	const updateNewPartition = (event: Event) => {
		const input = event.target as HTMLInputElement;

		if (input.value === '') {
			selectedPartition = $partitions[0];
		} else {
			selectedPartition = { partition: input.value, created_at: -1 };
		}
	};

	// Fire onSelect when Enter is pressed in the new partition input
	const selectNewPartition = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && onSelect && selectedPartition) {
			onSelect(selectedPartition);
		}
	};
</script>

<div
	class="absolute top-full left-0 z-50 mt-1 flex w-full cursor-pointer flex-col items-start divide-y-1 divide-solid divide-slate-200 rounded-md border border-slate-200 bg-white py-1"
>
	<input
		id="search-filter-input"
		class="w-full px-4 py-2 pt-1 text-sm text-slate-400 italic placeholder:text-slate-400 focus:outline-none"
		type="text"
		placeholder="Search partitions..."
		bind:value={searchFilter}
		aria-label="Search partitions"
	/>

	{#if $partitions.filter((p) => p.partition.includes(searchFilter)).length === 0}
		<span class="w-full cursor-text px-4 py-2 text-start text-sm text-slate-400 italic">
			No matching partitions found. Check your spelling, or create a new one.
		</span>
	{/if}

	{#each $partitions.filter((p) => p.partition.includes(searchFilter)) as partition}
		<button
			class="w-full cursor-pointer px-4 py-2 text-left hover:bg-slate-50"
			onclick={() => selectPartition(partition)}
		>
			{partition.partition}
		</button>
	{/each}

	<div class="relative flex w-full items-center">
		<input
			id="new-partition-input"
			class="text w-full px-4 py-2 placeholder:text-pink-500 hover:bg-slate-50 {selectedPartition?.created_at ===
			-1
				? ''
				: 'cursor-pointer'} focus:cursor-text focus:outline-none focus:placeholder:text-slate-400"
			type="text"
			placeholder="+ Add a new partition"
			oninput={updateNewPartition}
			onkeydown={selectNewPartition}
			value={selectedPartition?.created_at === -1 ? selectedPartition.partition : ''}
			aria-label="Add new partition"
		/>

		{#if selectedPartition?.created_at === -1}
			<button
				onclick={() => {
					if (onSelect && selectedPartition) onSelect(selectedPartition);
				}}
				class="absolute right-2 cursor-pointer rounded bg-pink-500 px-2 py-1 text-xs font-semibold text-white transition-all hover:bg-pink-600"
			>
				Create
			</button>
		{/if}
	</div>
</div>
