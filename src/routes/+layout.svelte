<script lang="ts">
	// Import tailwind styles for the app
	import '../app.css';

	// Import utilities
	import { onMount } from 'svelte';
	import * as api from '$lib/api';

	// Import stores
	import { partitions, showUploadModal } from '$lib/stores';

	// Import components
	import Header from './Header.svelte';
	import UploadModal from './UploadModal.svelte';

	// When the component is first initialised
	onMount(async () => {
		partitions.set(await api.fetchPartitions());
	});
</script>

<div class="flex h-screen flex-col font-mono">
	<Header />

	<main class="m-4 h-full overflow-scroll rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
		<slot />
	</main>

	{#if $showUploadModal}
		<UploadModal />
	{/if}
</div>
