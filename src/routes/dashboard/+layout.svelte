<script lang="ts">
    import { base } from "$app/paths";
    // Utilities
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import * as api from "$lib/api";
    import { _ } from "svelte-i18n";

    // States
    import { ui, dashboardData, indexerData } from "$lib/states.svelte";

    // Components
    import Header from "$lib/components/dashboard/Header.svelte";

    // Properties
    let { children } = $props();
    let loadError = $state<string | null>(null);

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

        // /dashboard is admin-only. If we already know the user isn't admin,
        // bounce them home instead of firing a request that will 403.
        if (indexerData.userInfo && !indexerData.userInfo.is_admin) {
            goto(`${base}/`);
            return;
        }

        // Load actors. On 403 the backend has told us this user can't see the
        // dashboard — show an access-denied state instead of a blank page.
        loadError = null;
        try {
            dashboardData.actors = await api.fetchActors();
        } catch (err) {
            loadError =
                err instanceof Error && err.message.includes("403")
                    ? $_('dashboard.no_permission')
                    : $_('dashboard.load_failed');
            console.error("fetchActors failed:", err);
        }

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
        //         goto(`${base}/`);
        //         return;
        //     }

        //     data.currentPartition.files = await api.fetchFilesFromPartition(data.currentPartition.partition.partition);
        // } else if (page.route.id?.includes("/file/")) {
        //     // Set the current partition in the state
        //     data.currentPartition.partition =
        //         data.partitions.find((p) => p.partition === page.params.partition) ?? null;

        //     if (!data.currentPartition?.partition) {
        //         console.log("No partition found, redirecting to partition list.");
        //         goto(`${base}/`);
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
    {#if loadError}
        <div class="flex h-full flex-col items-center justify-center p-8 text-center space-y-2">
            <span class="text-lg font-medium text-slate-700">{loadError}</span>
            <a href="{base}/" class="text-linagora-600 hover:underline">{$_('dashboard.back_to_home')}</a>
        </div>
    {:else}
        {@render children()}
    {/if}
</div>
