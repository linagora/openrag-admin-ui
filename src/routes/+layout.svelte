<script lang="ts">
	// Styles
	import '../app.css';

	// Utilities
	import { onMount } from 'svelte';
	import * as api from '$lib/api';

	// Stores
	import { showUploadModal, partitions } from '$lib/stores';

	// Components
	import Header from '$lib/components/Header.svelte';
	import UploadModal from '$lib/components/UploadModal/UploadModal.svelte';

	// Properties
	let { children } = $props();

	// When the component is first initialised
	onMount(async () => {
		partitions.set(await api.fetchPartitions());
	});
</script>

{#if $showUploadModal}
	<UploadModal />
{/if}

<div class="flex h-screen flex-col">
	<Header />

	<main class="m-4 h-full overflow-scroll rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
		{@render children()}
	</main>
</div>
