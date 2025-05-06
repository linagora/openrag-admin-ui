<script lang="ts">
	// Import stores
	import { partitions, selectedPartition } from '$lib/stores';

	// Import components
	import Checkbox from '$lib/components/Checkbox.svelte';

	// Import icons
	import Folder from '$lib/icons/Folder.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	import { deletePartition, fetchPartitions, getFilesFromPartition } from '$lib/api';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { redirect } from '@sveltejs/kit';
	import File from '$lib/icons/File.svelte';

	let files: Array<{ link: string }> = $state([]);

	const handleDelete = async (partition: string) => {
		// await deletePartition(partition);
	};

	onMount(async () => {
		if ($partitions.length === 0) {
			partitions.set(await fetchPartitions());
		}

		console.log($partitions);
		let partition = $partitions.find((p) => p.partition === page.params.partition);

		console.log(partition);
		if (partition) {
			$selectedPartition = partition;
		} else {
			redirect(307, '/');
		}

		files = await getFilesFromPartition(partition.partition);
	});
</script>

{#if files.length === 0}
	<div class="flex h-full items-center justify-center">
		<span class="text-center text-slate-500">No files found</span>
	</div>
{:else}
	<div class="flex h-full flex-col">
		{#each files as file}
			<div
				class="group flex items-center space-x-4 border-b border-slate-200 px-4 hover:bg-slate-100"
			>
				<Checkbox />
				<a href={file.link} class="flex w-full items-center space-x-3 py-4">
					<File className="size-6 stroke-3 fill-pink-500" />
					<span class="grow">{file.link.split('/').pop()}</span>
					<button
						class="cursor-pointer rounded p-1 hover:bg-slate-200"
						onclick={() => handleDelete(file.link)}
					>
						<Trash className="size-6 fill-white stroke-red-500" />
					</button>
				</a>
			</div>
		{/each}
	</div>
{/if}
