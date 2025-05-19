<script lang="ts">
	// Import app state
	import { partitions, currentPartition } from '$lib/stores';

	// Import components
	import Checkbox from '$lib/components/Checkbox.svelte';
	import TernaryCheckbox from '$lib/components/TernaryCheckbox.svelte';

	// Import icons
	import File from '$lib/icons/File.svelte';
	import Trash from '$lib/icons/Trash.svelte';

	// Import API and utilities
	import { deletePartition, fetchPartitions, fetchFilesFromPartition, deleteFile } from '$lib/api';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { redirect } from '@sveltejs/kit';

	interface FileItem {
		link: string;
		name: string;
	}

	// Generate a unique ID for the ternary checkbox
	const ternaryCheckboxId = 'files-select-all';

	let files = $state<Array<FileItem>>([]);

	// Selection logic
	let selected = $state(new Set<string>());

	// Compute ternary checkbox state
	let selectAllState = $state<'full' | 'partial' | 'none'>('none');

	$effect(() => {
		selectAllState =
			selected.size === 0 ? 'none' : selected.size === files.length ? 'full' : 'partial';
	});

	let isLoading = $state(true);
	let error = $state<string | null>(null);

	const toggleSelect = (fileLink: string) => {
		if (selected.has(fileLink)) {
			selected.delete(fileLink);
		} else {
			selected.add(fileLink);
		}
	};

	const isSelected = (fileLink: string) => selected.has(fileLink);

	const toggleSelectAll = () => {
		selected = selected.size === files.length ? new Set() : new Set(files.map((f) => f.link));
	};

	const handleSelectAllChange = (state: 'full' | 'partial' | 'none') => {
		selected = state === 'full' ? new Set(files.map((f) => f.link)) : new Set();
	};

	const handleDelete = async (fileLink: string) => {
		try {
			// Extract file_id from the link
			const parts = fileLink.split('/');
			const file_id = parts[parts.length - 1];

			await deleteFile(page.params.partition, file_id);

			// Refresh the file list after deletion
			files = await loadFiles(page.params.partition);
		} catch (e) {
			error = `Failed to delete file: ${e instanceof Error ? e.message : String(e)}`;
		}
	};

	const handleDeleteAll = async () => {
		try {
			// Keep track of any errors
			let hasErrors = false;

			// Process all deletions
			for (const fileLink of selected) {
				try {
					await handleDelete(fileLink);
				} catch (e) {
					hasErrors = true;
					console.error(`Error deleting file ${fileLink}:`, e);
				}
			}

			// Clear selection
			selected.clear();

			// Refresh the file list
			files = await loadFiles(page.params.partition);

			if (hasErrors) {
				error = 'Some files could not be deleted. Check console for details.';
			}
		} catch (e) {
			error = `Failed to delete files: ${e instanceof Error ? e.message : String(e)}`;
		}
	};

	// Modified to handle label click directly
	const handleLabelClick = () => {
		handleSelectAllChange(selectAllState === 'full' ? 'none' : 'full');
	};

	const getFileName = (path: string): string => {
		if (typeof path !== 'string') {
			return 'Unknown file';
		}

		try {
			const parts = path.split('/');
			return parts[parts.length - 1] || path;
		} catch {
			return path || 'Unknown file';
		}
	};

	const loadFiles = async (partitionName: string) => {
		isLoading = true;
		error = null;

		try {
			const filesList = await fetchFilesFromPartition(partitionName);

			if (!Array.isArray(filesList)) {
				throw new Error('Invalid response format from server');
			}

			return filesList.map((file) => {
				// Handle string file paths
				if (typeof file === 'string') {
					return {
						link: file,
						name: getFileName(file)
					};
				}

				// Handle case where API returns objects
				if (file && typeof file === 'object') {
					const fileObj = file as Record<string, unknown>;

					// If object has link property
					if ('link' in fileObj && typeof fileObj.link === 'string') {
						return {
							link: fileObj.link,
							name: getFileName(fileObj.link)
						};
					}

					// If object has name property
					if ('name' in fileObj && typeof fileObj.name === 'string') {
						const link =
							'link' in fileObj && typeof fileObj.link === 'string' ? fileObj.link : fileObj.name;
						return { link, name: fileObj.name };
					}
				}

				// Fallback for unexpected data
				return {
					link: String(file),
					name: 'Unknown file'
				};
			});
		} catch (e) {
			error = `Failed to load files: ${e instanceof Error ? e.message : String(e)}`;
			return [];
		} finally {
			isLoading = false;
		}
	};

	onMount(async () => {
		try {
			if ($partitions.length === 0) {
				$partitions = await fetchPartitions();
			}

			const partition = $partitions.find((p) => p.partition === page.params.partition);

			if (!partition) {
				redirect(307, '/');
				return;
			}

			currentPartition.set(partition);
			files = await loadFiles(partition.partition);
		} catch (e) {
			error = `Error loading partition data: ${e instanceof Error ? e.message : String(e)}`;
			files = [];
		}
	});
</script>

{#if isLoading}
	<div class="flex h-full items-center justify-center">
		<span class="text-sm text-slate-500">Loading files...</span>
	</div>
{:else if error}
	<div class="flex h-full items-center justify-center">
		<span class="text-sm text-red-500">{error}</span>
	</div>
{:else if files.length === 0}
	<div class="flex h-full items-center justify-center">
		<span class="text-sm text-slate-500">No files found</span>
	</div>
{:else}
	<div class="relative flex h-full flex-col overflow-y-auto">
		<!-- List header -->
		<div
			class="sticky top-0 z-10 flex justify-between border-b border-slate-200 bg-white px-4 py-3"
		>
			<div class="flex items-center gap-3">
				<TernaryCheckbox
					checked={selectAllState}
					onChange={handleSelectAllChange}
				/>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<span
					onclick={handleLabelClick}
					class="ml-2 cursor-pointer text-sm text-slate-600"
					role="button"
					tabindex="0"
				>
					{selected.size} of {files.length} files selected
				</span>
			</div>
		</div>
		<div class="flex flex-col">
			{#each files as file}
				<div
					class="group flex items-center space-x-4 border-b border-slate-200 px-4 hover:bg-slate-100"
				>
					<Checkbox checked={isSelected(file.link)} onChange={() => toggleSelect(file.link)} />
					<a
						href={file.link}
						class="flex w-full cursor-pointer items-center space-x-3 py-4"
						target="_blank"
						rel="noopener noreferrer"
					>
						<File className="size-6 fill-pink-500 stroke-pink-500 stroke-3" />
						<span class="grow">{file.name}</span>
					</a>
					<button
						class="cursor-pointer rounded p-1 hover:bg-slate-200"
						onclick={() => handleDelete(file.link)}
						aria-label={`Delete file ${file.name}`}
					>
						<Trash className="size-6 fill-transparent stroke-red-500" />
					</button>
				</div>
			{/each}
		</div>
		<div class="grow"></div>
		{#if selected.size > 0}
			<footer
				class="sticky bottom-0 left-0 z-10 flex w-full items-center justify-between border-t border-slate-200 bg-white p-4"
			>
				<span class="text-slate-600">
					{selected.size} file{selected.size > 1 ? 's' : ''} selected
				</span>
				<button
					class="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600 focus:outline-none"
					onclick={handleDeleteAll}
				>
					<Trash className="size-5 fill-transparent stroke-white" /> Delete All
				</button>
			</footer>
		{/if}
	</div>
{/if}
