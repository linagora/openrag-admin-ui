<script lang="ts">
	// Import icons
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
import Upload from '$lib/icons/Upload.svelte';
	import { selectedPartition, showUploadModal } from '$lib/stores';

	const handleUploadButtonClick = () => {
		showUploadModal.set(true);
	};
</script>

<header class="flex items-center justify-between p-4 pb-0">
	<div class="flex items-center space-x-2 text-xl font-bold">
		<a href="/" class="rounded-lg px-2 py-1 hover:bg-slate-100"> RAGondin Indexer </a>
		{#if $selectedPartition}
			<ChevronDown className="size-4 -rotate-90 stroke-3 stroke-pink-500" />
			<span class="px-2">
				{$selectedPartition.partition}
			</span>
		{/if}
	</div>
	<button
		class="btn flex items-center gap-2 rounded-xl border-none bg-pink-500 font-semibold text-white transition-colors hover:bg-pink-600"
		onclick={handleUploadButtonClick}
	>
		<Upload className="stroke-3 size-5" /> Upload File
	</button>
</header>
