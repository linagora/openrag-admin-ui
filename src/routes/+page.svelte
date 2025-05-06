<script>
	import { onMount } from 'svelte';

	// Import components
	import PartitionList from './PartitionList.svelte';
	import { selectedPartition } from '$lib/stores';

	onMount(() => {
		selectedPartition.set(null);
	});
</script>

<PartitionList />
