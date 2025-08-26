<script lang="ts">
    // Utilities
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import * as api from "$lib/api";

    // States
    import { ui, dashboardData } from "$lib/states.svelte";

    // Components
    import Header from "$lib/components/dashboard/Header.svelte";

    // Properties
    let { children } = $props();

    /**
     * Function to refresh tasks periodically.
     * It fetches the current tasks and updates their state.
     * If a task is completed, it fetches the latest partitions.
     */
    async function refreshTasks() {
        // let currentTasks = data.tasks.filter((task) => task.state !== "COMPLETED" && task.state !== "FAILED");
        // // If there are no tasks to refresh, exit early
        // if (currentTasks.length === 0) return;
        // currentTasks.forEach(async (currentTask) => {
        //     const res = await api.fetchTask(currentTask.task_id);
        //     data.tasks.forEach(async (task) => {
        //         if (task.task_id === res.task_id) {
        //             // Update the task in the tasks array
        //             task.state = res.task_state;
        //             if (task.state === "COMPLETED") data.partitions = await api.fetchPartitions();
        //         }
        //     });
        // });
    }

    $effect(() => {
        console.log("Handling routing for:", page.route.id);
        handleRouting();
    });

    /**
     * This function handles data loading for different routes of the application
     */
    async function handleRouting() {
        if (ui.showLoginPage) return;

        // Load actors
        dashboardData.actors = await api.fetchActors();

        // if (page.route.id === "/indexer") {
        //     // Reset navigation states
        //     data.currentPartition = { partition: null, files: [] };
        //     data.currentFile = null;

        //     // Load tasks
        //     data.tasks = await api.fetchTasks();
        //     setInterval(refreshTasks, 5000); // Refresh every 5 seconds
        // } else if (page.route.id?.includes("/partition/") && !page.route.id.includes("/file/")) {
        //     data.currentFile = null; // Reset current file state

        //     // Set the current partition in the state
        //     data.currentPartition.partition =
        //         data.partitions.find((p) => p.partition === page.params.partition) ?? null;

        //     if (!data.currentPartition?.partition) {
        //         console.log("No partition found, redirecting to partition list.");
        //         goto("/");
        //         return;
        //     }

        //     data.currentPartition.files = await api.fetchFilesFromPartition(data.currentPartition.partition.partition);
        // } else if (page.route.id?.includes("/file/")) {
        //     // Set the current partition in the state
        //     data.currentPartition.partition =
        //         data.partitions.find((p) => p.partition === page.params.partition) ?? null;

        //     if (!data.currentPartition?.partition) {
        //         console.log("No partition found, redirecting to partition list.");
        //         goto("/");
        //         return;
        //     }

        //     try {
        //         // Set the current partition in the state
        //         data.currentFile = await api.fetchFile(data.currentPartition?.partition.partition, page.params.file);
        //     } catch {
        //         console.log("No file found, redirecting to file list.");
        //         goto(`/partition/${data.currentPartition.partition.partition}`);
        //         return;
        //     }
        // }
    }
</script>

<Header />

<div class="grow m-4 h-full overflow-scroll rounded-2xl border border-slate-200 bg-white shadow-sm">
    {@render children()}
</div>
