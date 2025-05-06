<script lang="ts">
	// Import utilities
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	// Import stores
	import { partitions, showUploadModal } from '$lib/stores';

	// Import components
	import PartitionInput from './PartitionInput.svelte';
	import Pip from '$lib/components/Pip.svelte';

	// Import icons
	import Upload from '$lib/icons/Upload.svelte';
	import Close from '$lib/icons/Close.svelte';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';

	// Import types
	import type { RagondinPartition } from '$lib/types';
	import { indexFile } from '$lib/api';

	// Properties

	let {}: {} = $props();

	let selectedPartition: RagondinPartition | undefined = $state();
	let files: FileList | undefined = $state();
	let fileID: string | undefined = $state();
	let metadata: string | undefined = $state();

	let showDropdown: boolean = $state(false);

	let uploadStatus: string = $state('No file selected.');

	// Event Handlers

	// Closes the upload modal (and the dropdown, so it's not opened when the modal appears again)

	const handleCloseModal = () => {
		showUploadModal.set(false);

		showDropdown = false;
	};

	// Toggles open and close the dropdown

	const handleToggleDropdown = () => {
		showDropdown = !showDropdown;
	};

	// Locally sets a selected partition when a new one should be created

	const handleNewPartitionInput = () => {
		const input = document.getElementById('partition-btn') as HTMLInputElement;

		if (input.value === '') {
			selectedPartition = $partitions[0];
		} else {
			selectedPartition = { partition: input.value, created_at: -1 };
		}
	};

	// Change uplaod button text to reflect the name of the file after selecting it

	const handleFileUpload = () => {
		const input = document.getElementById('file-upload-btn') as HTMLInputElement;

		uploadStatus = input.value.split('\\').pop() || '';
		fileID = uuidv4();
	};

	// Uploads the file to the partition then close the modal if successful
	const handleUploadButtonClick = async () => {
		try {
			if (files && files[0] && selectedPartition && fileID) {
				const res = await indexFile(files[0], selectedPartition.partition, fileID, metadata);
				console.log(res);
				handleCloseModal();
			} else {
				alert('File, partition, or file ID is missing.');
			}
		} catch (error) {
			console.error('Error uploading file:', error);
		}
	};

	// When the component is first initialised
	onMount(() => {
		selectedPartition = $partitions[0];
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->

<!-- svelte-ignore a11y_click_events_have_key_events -->

<div
	class="absolute h-screen w-screen bg-slate-500/20 backdrop-blur-xs"
	onclick={handleCloseModal}
></div>

<div
	class="absolute top-1/2 left-1/2 flex w-1/3 min-w-144 -translate-1/2 flex-col space-y-4 rounded-lg bg-white p-4 shadow-lg"
>
	<div class="flex justify-between">
		<h1 class="text-xl font-semibold">Upload File</h1>

		<button onclick={handleCloseModal} class="cursor-pointer">
			<Close className="size-4 stroke-3" />
		</button>
	</div>

	<!-- Partition selection -->

	<div class="relative flex flex-col">
		<label class="mb-2 flex cursor-pointer items-center space-x-2 font-medium" for="partition-btn">
			<span> Partition </span>

			{#if selectedPartition?.created_at === -1}
				<Pip text="New" />
			{/if}
		</label>

		{#if $partitions.length !== 0}
			<button
				id="partition-btn"
				class="btn flex items-center justify-between"
				onclick={handleToggleDropdown}
			>
				<span> {selectedPartition?.partition} </span>

				<ChevronDown
					className="size-4 stroke-2 stroke-slate-500 {showDropdown ? 'rotate-180' : ''}"
				/>
			</button>

			{#if showDropdown}
				<PartitionInput bind:selectedPartition />
			{/if}
		{:else}
			<input
				id="partition-btn"
				class="text btn w-full placeholder:text-pink-500 focus:cursor-text focus:outline-none focus:placeholder:text-slate-400"
				type="text"
				placeholder="+ Add a new partition"
				oninput={handleNewPartitionInput}
			/>
		{/if}
	</div>

	<!-- File upload -->

	<div class="relative flex flex-col">
		<label class="mb-2 cursor-pointer font-medium" for="file-upload-btn"> Select a file </label>

		<label class="btn border-dashed border-slate-300" for="file-upload-btn">
			{uploadStatus}
		</label>

		<input id="file-upload-btn" type="file" bind:files class="hidden" oninput={handleFileUpload} />
	</div>

	<!-- File ID -->
	<div class="relative flex flex-col">
		<label class="mb-2 cursor-pointer font-medium" for="file-id-input"> File ID </label>
		<input
			id="file-id-input"
			type="text"
			placeholder={uuidv4()}
			bind:value={fileID}
			class="btn placeholder:text-slate-400 hover:cursor-text"
		/>
	</div>

	<!-- File metadata -->
	<div class="relative flex flex-col">
		<label class="mb-2 cursor-pointer font-medium" for="file-id-input"> Metadata </label>
		<textarea
			placeholder="&#123; &quot;key&quot;: &quot;value&quot; &#125;"
			bind:value={metadata}
			class="btn min-h-32 placeholder:text-slate-400 hover:cursor-text"
		></textarea>
	</div>

	<!-- Cancel and Upload buttons -->

	<div class="flex space-x-4 self-end">
		<button
			class="btn flex items-center gap-2 rounded-xl font-medium text-slate-500 transition-colors"
			onclick={handleCloseModal}
		>
			Cancel
		</button>

		<button
			class="btn flex items-center gap-2 rounded-xl border-none bg-pink-500 font-semibold text-white transition-colors hover:bg-pink-600"
			onclick={handleUploadButtonClick}
		>
			<Upload className="stroke-3 size-5" /> Upload File
		</button>
	</div>
</div>
