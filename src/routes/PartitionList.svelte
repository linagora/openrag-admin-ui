<script lang="ts">
	// Import stores
	import { partitions } from '$lib/stores';

	// Import components
	import Checkbox from '$lib/components/Checkbox.svelte';

	// Import icons
	import Folder from '$lib/icons/Folder.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	import { deletePartition } from '$lib/api';

	const formatDate = (timestamp: number): string => {
		return new Date(timestamp * 1000).toLocaleString('fr');
	};

	const handleDelete = async (partition: string) => {
		await deletePartition(partition);
	};
</script>

{#if $partitions.length === 0}
	<div class="flex h-full items-center justify-center">
		<span class="text-center text-slate-500">No partitions available</span>
	</div>
{:else}
	<div class="flex h-full flex-col">
		{#each $partitions as partition}
			<div
				class="group flex items-center space-x-4 border-b border-slate-200 px-4 hover:bg-slate-100"
			>
				<Checkbox />
				<a href="/partition/{partition.partition}" class="flex w-full py-4 items-center space-x-3">
					<Folder className="size-6 stroke-3 fill-pink-500" />
					<span class="grow">{partition.partition}</span>
					<span class="text-xs text-slate-500">
						Created : {formatDate(partition.created_at)}
					</span>
				</a>
				<button
					class="cursor-pointer rounded p-1 hover:bg-slate-200"
					onclick={() => handleDelete(partition.partition)}
				>
					<Trash className="size-6 fill-white stroke-red-500" />
				</button>
			</div>
		{/each}
	</div>
{/if}
