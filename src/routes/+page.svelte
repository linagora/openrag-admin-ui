<script>
	// Import utilities
	import { onMount } from 'svelte';

	// Import stores
	import { currentPartition } from '$lib/stores';

	// Import components
	import PartitionList from '$lib/components/partitions/PartitionList.svelte';

	onMount(() => {
		currentPartition.set(null);
	});
</script>

<PartitionList />
