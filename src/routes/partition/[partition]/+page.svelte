<script lang="ts">
	// Utilities
	import { onMount } from 'svelte';
	import { redirect } from '@sveltejs/kit';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as api from '$lib/api';

	// Stores
	import { partitions, currentPartition } from '$lib/stores';

	// Componxents
	import Checkbox from '$lib/components/Checkbox.svelte';
	import TernaryCheckbox from '$lib/components/TernaryCheckbox.svelte';

	// Icons
	import File from '$lib/icons/File.svelte';
	import Trash from '$lib/icons/Trash.svelte';

	// Types
	import type { RagondinFile } from '$lib/types';
	import type { TernaryCheckboxStatus } from '$lib/components/TernaryCheckbox.svelte';

	// Properties
	let files = $state<RagondinFile[]>([]); // Files in the current partition

	// File selection properties
	let selectedFiles: Set<RagondinFile> = $state(new Set()); // Track selected files
	let selectAllStatus: TernaryCheckboxStatus = $state('none'); // Compute ternary checkbox state

	/**
	 * Toggles a file's selection status
	 * @param file the file to toggle
	 */
	const toggleSelect = (file: RagondinFile) => {
		if (selectedFiles.has(file)) {
			selectedFiles.delete(file);
		} else {
			selectedFiles.add(file);
		}

		selectedFiles = new Set(selectedFiles); // Force refresh
	};

	/**
	 * Select or unselect all files
	 * @param state
	 */
	const toggleSelectAll = () => {
		if (selectAllStatus === 'full') {
			// Unselect all files
			selectedFiles.clear();
			selectedFiles = new Set(selectedFiles); // Force refresh
		} else {
			// Select all files
			selectedFiles = new Set(files);
		}
	};

	const refreshFileList = async () => {
		if (!$currentPartition?.partition) {
			console.log('No partition found, redirecting to partition list.');
			goto('/');
			return;
		}

		try {
			files = await api.fetchFilesFromPartition($currentPartition.partition);
			if (files.length === 0) {
				partitions.set(await api.fetchPartitions());
				// If no files left, redirect to the partition list
				goto('/');
			}
		} catch (error: any) {
			if (error.message.includes('404')) {
				// A 404 error indicates that the partition has been deleted since no files are left
				console.log('No partition found, redirecting to partition list.');
				partitions.set(await api.fetchPartitions());
				goto('/');
			} else console.error('Error fetching files:', error);
		}
	};

	/**
	 * Deletes a file
	 * @param file the file to delete
	 */
	const deleteFile = async (file: RagondinFile) => {
		if ($currentPartition?.partition) {
			const link: string | undefined = file.link.split('/').pop();
			if (link) {
				const success: boolean = await api.deleteFile($currentPartition?.partition, link);
				if (success) {
					selectedFiles.delete(file);
					refreshFileList();
				}
			}
		}
	};

	/**
	 * Deletes all the selected files
	 */
	const deleteAllSelectedFiles = async () => {
		if (
			confirm(
				`You are about to delete ${selectedFiles.size} files.\nAre you sure you want to proceed ?`
			)
		)
			for (const file of selectedFiles) {
				await deleteFile(file);
			}
	};

	$effect(() => {
		// Refresh selectAllStatus
		selectAllStatus =
			selectedFiles.size === 0 ? 'none' : selectedFiles.size === files.length ? 'full' : 'partial';
	});

	onMount(async () => {
		if (!$partitions || $partitions.length === 0) {
			// Fetch partitions if not already fetched
			partitions.set(await api.fetchPartitions());
		}

		if (page.params.partition) {
			// Fetch the partition from the URL parameter
			const partition = page.params.partition;
			// Set the current partition in the store
			currentPartition.set($partitions.find((p) => p.partition === partition) || null);
		}

		refreshFileList();
	});
</script>

{#if files.length === 0}
	<div class="flex h-full items-center justify-center">
		<span class="text-sm text-slate-500">
			No files available. Please wait a bit for the files to be fetched, or start indexing files
			now.
		</span>
	</div>
{:else}
	<div class="relative flex h-full flex-col overflow-y-auto">
		<!-- List header -->
		<div
			class="sticky top-0 z-10 flex justify-between border-b border-slate-200 bg-white px-4 py-3"
		>
			<div class="flex items-center gap-3">
				<TernaryCheckbox checked={selectAllStatus} onChange={toggleSelectAll} />
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<button
					onclick={toggleSelectAll}
					class="ml-2 cursor-pointer text-sm text-slate-600"
					tabindex="0"
				>
					{selectedFiles.size} of {files.length} files selected
				</button>
			</div>
		</div>
		<div class="flex flex-col">
			{#each files as file}
				<div
					class="group flex items-center space-x-4 border-b border-slate-200 px-4 hover:bg-slate-100"
				>
					<Checkbox checked={selectedFiles.has(file)} onChange={() => toggleSelect(file)} />
					<a href={file.link} class="flex w-full items-center space-x-3 py-4">
						<File className="size-6 fill-pink-500 stroke-3" />
						<span class="grow">{file.link.split('/').pop()}</span>
					</a>
					<button onclick={() => deleteFile(file)} aria-label={`Delete file ${file.link}`}>
						<Trash
							className="size-8 fill-transparent stroke-red-500 hover:stroke-red-600 cursor-pointer rounded p-1 hover:bg-slate-200"
						/>
					</button>
				</div>
			{/each}
		</div>
		<div class="grow"></div>
		{#if selectedFiles.size > 0}
			<footer
				class="sticky bottom-0 left-0 z-10 flex w-full items-center justify-between border-t border-slate-200 bg-white p-4"
			>
				<span class="text-slate-600">
					{selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected
				</span>
				<button
					class="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600 focus:outline-none"
					onclick={deleteAllSelectedFiles}
				>
					<Trash className="size-5 fill-transparent stroke-white" /> Delete selected
				</button>
			</footer>
		{/if}
	</div>
{/if}
