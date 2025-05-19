<script lang="ts">
	// Import stores
	import { currentPartition, showUploadModal } from '$lib/stores';

	// Import icons
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import Upload from '$lib/icons/Upload.svelte';
	import Home from '$lib/icons/Home.svelte';

	/**
	 * Opens the upload modal
	 */
	const openUploadModal = () => {
		showUploadModal.set(true);
	};
</script>

<header class="flex items-center justify-between p-4 pb-0">
	<div class="flex items-center space-x-2 text-xl font-bold">
		<a href="/" class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100">
			<Home className="size-6 stroke-pink-500 fill-transparent" /> RAGondin Indexer
		</a>
		{#if $currentPartition}
			<ChevronDown className="size-4 -rotate-90 stroke-3 stroke-pink-500" />
			<span class="px-2">
				{$currentPartition.partition}
			</span>
		{/if}
	</div>
	<button
		class="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-pink-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-pink-600 focus:outline-none"
		onclick={openUploadModal}
	>
		<Upload className="size-5 stroke-3" /> Upload files
	</button>
</header>
