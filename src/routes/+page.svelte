<script lang="ts">
	// Utilities
	import { onMount } from 'svelte';
	import * as api from '$lib/api';
	import { formatDate } from '$lib/utils';

	// Stores
	import { partitions, displayMode, currentPartition, currentFile } from '$lib/stores';

	// Components
	import Checkbox from '$lib/components/Checkbox.svelte';
	import TernaryCheckbox from '$lib/components/TernaryCheckbox.svelte';

	// Icons
	import Folder from '$lib/icons/Folder.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	import List from '$lib/icons/List.svelte';
	import Grid from '$lib/icons/Grid.svelte';

	// Types
	import type { RagondinPartition } from '$lib/types';
	import type { TernaryCheckboxStatus } from '$lib/components/TernaryCheckbox.svelte';

	// Partition selection properties
	let selectedPartitions: Set<RagondinPartition> = $state(new Set()); // Track selected partitions
	let selectAllStatus: TernaryCheckboxStatus = $state('none'); // Compute ternary checkbox state

	/**
	 * Toggles a partition's selection status
	 * @param partition the partition to toggle
	 */
	const toggleSelect = (partition: RagondinPartition) => {
		if (selectedPartitions.has(partition)) {
			selectedPartitions.delete(partition);
		} else {
			selectedPartitions.add(partition);
		}

		selectedPartitions = new Set(selectedPartitions); // Force refresh
	};

	/**
	 * Select or unselect all partitions
	 * @param state
	 */
	const toggleSelectAll = () => {
		if (selectAllStatus === 'full') {
			// Unselect all partitions
			selectedPartitions.clear();
			selectedPartitions = new Set(selectedPartitions); // Force refresh
		} else {
			// Select all partitions
			selectedPartitions = new Set($partitions);
		}
	};

	/**
	 * Deletes a partition
	 * @param partition the partition to delete
	 */
	const deletePartition = async (partition: RagondinPartition) => {
		const success = await api.deletePartition(partition.partition);
		if (success) {
			partitions.set(await api.fetchPartitions());
			selectedPartitions.delete(partition);
		}
	};

	/**
	 * Deletes all the selected partitions
	 */
	const deleteAllSelectedPartitions = async () => {
		if (
			confirm(
				`You are about to delete ${selectedPartitions.size} partitions.\nAre you sure you want to proceed ?`
			)
		)
			for (const partition of selectedPartitions) {
				await deletePartition(partition);
			}
	};

	$effect(() => {
		// Refresh selectAllStatus
		selectAllStatus =
			selectedPartitions.size === 0
				? 'none'
				: selectedPartitions.size === $partitions.length
					? 'full'
					: 'partial';
	});

	onMount(() => {
		currentPartition.set(null);
		currentFile.set(null);
	});
</script>

{#if $partitions.length === 0}
	<div class="flex h-full items-center justify-center">
		<span class="text-sm text-slate-500">
			No partitions available. Please wait a bit for the partitions to be fetched, or start indexing
			files now.
		</span>
	</div>
{:else}
	<div class="relative flex h-full flex-col overflow-y-auto">
		<!-- List header -->
		<div
			class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white"
		>
			<div class="flex items-center gap-3 py-3 pl-4">
				<TernaryCheckbox checked={selectAllStatus} onChange={toggleSelectAll} />
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<button
					onclick={toggleSelectAll}
					class="ml-2 cursor-pointer text-sm text-slate-600"
					tabindex="0"
				>
					{selectedPartitions.size} of {$partitions.length} partitions selected
				</button>
			</div>
			<div class="flex items-center pr-3">
				<button
					class="cursor-pointer {$displayMode === 'list' ? 'font-bold' : ''}"
					onclick={() => {
						displayMode.set('list');
					}}
				>
					<List
						className="inline size-8 p-1 hover:bg-slate-100 rounded {$displayMode === 'list'
							? 'fill-slate-500'
							: 'fill-slate-300'}"
					/>
				</button>
				<button
					class="cursor-pointer {$displayMode === 'grid' ? 'font-bold' : ''}"
					onclick={() => {
						displayMode.set('grid');
					}}
				>
					<Grid
						className="inline size-8 hover:bg-slate-100 p-1 rounded {$displayMode === 'grid'
							? 'fill-slate-500'
							: 'fill-slate-300'}"
					/>
				</button>
			</div>
		</div>

		{#if $displayMode === 'list'}
			<!-- Partition list -->
			<div class="flex flex-col">
				{#each $partitions as partition}
					<div
						class="group flex items-center space-x-4 border-b border-slate-200 px-4 hover:bg-slate-100"
					>
						<Checkbox
							checked={selectedPartitions.has(partition)}
							onChange={() => toggleSelect(partition)}
						/>
						<a
							href="/partition/{partition.partition}"
							class="flex w-full items-center space-x-3 py-4"
						>
							<Folder className="size-6 fill-pink-500 stroke-3" />
							<span class="grow">{partition.partition}</span>
							<span class="text-xs text-slate-500">
								Created: {formatDate(partition.created_at)}
							</span>
						</a>
						<button
							onclick={() => deletePartition(partition)}
							aria-label={`Delete partition ${partition.partition}`}
						>
							<Trash
								className="size-8 fill-transparent stroke-red-500 hover:stroke-red-600 cursor-pointer rounded p-1 hover:bg-slate-200"
							/>
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Partition grid -->
			<div class="grid grid-cols-8 gap-4 p-4">
				{#each $partitions as partition}
					<div
						class="group relative rounded-lg border border-slate-200 bg-white p-2 shadow-md hover:shadow-lg"
					>
						<Checkbox
							checkboxClasses="absolute self-start top-1 left-1 z-10"
							checked={selectedPartitions.has(partition)}
							onChange={() => toggleSelect(partition)}
						/>
						<button
							class="absolute top-1.5 right-1.5 z-10"
							onclick={() => deletePartition(partition)}
							aria-label={`Delete partition ${partition.partition}`}
						>
							<Trash
								className="size-7 fill-transparent stroke-red-500 hover:stroke-red-600 cursor-pointer rounded p-0.5 hover:bg-red-50"
							/>
						</button>
						<a
							href="/partition/{partition.partition}"
							class="flex h-full flex-col items-center py-4 text-center"
						>
							<Folder className="size-12 fill-pink-500 stroke-3" />
							<span class="grow font-bold">{partition.partition}</span>
							<span class="text-xs text-slate-500">
								Created: {formatDate(partition.created_at)}
							</span>
						</a>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Empty growing div to ensure footer is at the bottom -->
		<div class="grow"></div>

		<!-- Delete all selected partitions footer -->
		{#if selectedPartitions.size > 0}
			<footer
				class="sticky bottom-0 left-0 z-10 flex w-full items-center justify-between border-t border-slate-200 bg-white p-4"
			>
				<span class="text-slate-600">
					{selectedPartitions.size} partition{selectedPartitions.size > 1 ? 's' : ''} selected
				</span>
				<button
					class="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600 focus:outline-none"
					onclick={deleteAllSelectedPartitions}
				>
					<Trash className="size-5 fill-transparent stroke-white" /> Delete selected
				</button>
			</footer>
		{/if}
	</div>
{/if}
