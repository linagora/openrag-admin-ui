<script lang="ts">
    // Utilities
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import * as api from "$lib/api";

    // States
    import { ui, indexerData } from "$lib/states.svelte";

    // Components
    import Header from "$lib/components/indexer/Header.svelte";
    import UploadModal from "$lib/components/indexer/UploadModal/UploadModal.svelte";
    import { onMount } from "svelte";

    // Properties
    let { children } = $props();
    let refreshTasksInterval: number | undefined;

    /**
     * Function to refresh tasks periodically.
     * It fetches the current tasks and updates their state.
     * If a task is completed, it fetches the latest partitions.
     */
    async function refreshTasks() {
        let currentTasks = indexerData.tasks.filter((task) => task.state !== "COMPLETED" && task.state !== "FAILED");

        // If there are no tasks to refresh, exit early
        if (currentTasks.length === 0) return;

        currentTasks.forEach(async (currentTask) => {
            const res = await api.fetchTask(currentTask.task_id);
            indexerData.tasks.forEach(async (task) => {
                if (task.task_id === res.task_id) {
                    // Update the task in the tasks array
                    task.state = res.task_state;
                    if (task.state === "COMPLETED") indexerData.partitions = await api.fetchPartitions();
                }
            });
        });
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

        // Load partitions
        indexerData.partitions = await api.fetchPartitions();

        if (page.route.id === "/indexer") {
            // Reset navigation states
            indexerData.currentPartition = { partition: null, files: [] };
            indexerData.currentFile = null;

            // Load tasks
            indexerData.tasks = await api.fetchTasks();
            refreshTasksInterval = setInterval(refreshTasks, 5000); // Refresh every 5 seconds
        } else if (page.route.id?.includes("/partition/") && !page.route.id.includes("/file/")) {
            indexerData.currentFile = null; // Reset current file state

            // Set the current partition in the state
            indexerData.currentPartition.partition =
                indexerData.partitions.find((p) => p.partition === page.params.partition) ?? null;

            if (!indexerData.currentPartition?.partition) {
                console.log("No partition found, redirecting to partition list.");
                goto("/");
                return;
            }

            indexerData.currentPartition.files = await api.fetchFilesFromPartition(indexerData.currentPartition.partition.partition);
        } else if (page.route.id?.includes("/file/")) {
            // Set the current partition in the state
            indexerData.currentPartition.partition =
                indexerData.partitions.find((p) => p.partition === page.params.partition) ?? null;

            if (!indexerData.currentPartition?.partition) {
                console.log("No partition found, redirecting to partition list.");
                goto("/");
                return;
            }

            try {
                // Set the current partition in the state
                indexerData.currentFile = await api.fetchFile(indexerData.currentPartition?.partition.partition, page.params.file);
            } catch {
                console.log("No file found, redirecting to file list.");
                goto(`/partition/${indexerData.currentPartition.partition.partition}`);
                return;
            }
        }

        // if (activeUploads.current) {
        //     activeUploads.current.forEach((upload) => {
        //         if (["SUCCESS", "FAILED"].includes(getUploadProgress(upload).status)) {
        //             activeUploads.current = activeUploads.current.filter((u) => u !== upload); // Remove completed uploads
        //         }
        //     });
        // }
    }

    onMount(() => {
        return () => {
            console.log("Leaving indexer, clearing intervals.");
            // Clear any intervals or timeouts here if needed
            clearInterval(refreshTasksInterval);
        };
    });
</script>

{#if ui.showUploadModal}
    <UploadModal />
{/if}

<Header />

<div class="grow m-4 h-full overflow-scroll rounded-2xl border border-slate-200 bg-white shadow-sm">
    {@render children()}
</div>
