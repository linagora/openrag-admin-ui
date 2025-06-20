<script lang="ts">
	// Styles
	import '../app.css';

	// Utilities
	import { onMount } from 'svelte';
	import * as api from '$lib/api';

	// Stores
	import { showUploadModal, partitions, tasks } from '$lib/stores';

	// Components
	import Header from '$lib/components/layout/Header.svelte';
	import UploadModal from '$lib/components/UploadModal/UploadModal.svelte';

	// Properties
	let { children } = $props();

	const refreshTasks = async () => {
		let currentTasks = $tasks.filter(
			(task) => task.state !== 'COMPLETED' && task.state !== 'FAILED'
		);

		// If there are no tasks to refresh, exit early
		if (currentTasks.length === 0) return;

		currentTasks.forEach(async (currentTask) => {
			const res = await api.fetchTask(currentTask.task_id);
			$tasks.forEach(async (task) => {
				if (task.task_id === res.task_id) {
					// Update the task in the tasks array
					task.state = res.task_state;
					if (task.state === 'COMPLETED') partitions.set(await api.fetchPartitions());
				}
			});
			tasks.set([...$tasks]); // Trigger reactivity
		});
	};

	// When the component is first initialised
	onMount(async () => {
		partitions.set(await api.fetchPartitions());

		tasks.set(await api.fetchTasks());
		setInterval(refreshTasks, 5000); // Refresh every 5 seconds
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
