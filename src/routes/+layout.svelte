<script lang="ts">
    /**
     * This file serves as the main layout for the application.
     * It handles authentication, UI state, data loading, and rendering of child components.
     * @author Ulysse Bouchet for LINAGORA
     */

    // Styles
    import "../app.css";

    // Utilities
    import { onMount } from "svelte";
    import { getUploadProgress } from "$lib/utils";
    import * as api from "$lib/api";

    // States, persisted states, and cookies
    import { ui, tasks, partitions } from "$lib/states.svelte";
    import { activeUploads, authToken, authTokenCreatedAt } from "$lib/persisted.svelte";

    // Components
    import Header from "$lib/components/layout/Header.svelte";
    import UploadModal from "$lib/components/UploadModal/UploadModal.svelte";
    import Login from "$lib/components/layout/Login.svelte";

    // Icons
    import PartialCircle from "$lib/icons/PartialCircle.svelte";

    // Properties
    let { children } = $props();

    // Reactive variables
    let loading = $state(true);

    /**
     * Function to refresh tasks periodically.
     * It fetches the current tasks and updates their state.
     * If a task is completed, it fetches the latest partitions.
     */
    async function refreshTasks() {
        let currentTasks = tasks.tasks.filter((task) => task.state !== "COMPLETED" && task.state !== "FAILED");

        // If there are no tasks to refresh, exit early
        if (currentTasks.length === 0) return;

        currentTasks.forEach(async (currentTask) => {
            const res = await api.fetchTask(currentTask.task_id);
            tasks.tasks.forEach(async (task) => {
                if (task.task_id === res.task_id) {
                    // Update the task in the tasks array
                    task.state = res.task_state;
                    if (task.state === "COMPLETED") partitions.partitions = await api.fetchPartitions();
                }
            });
        });
    }

    // Run when the component initializes for the first time
    onMount(() => {
        (async () => {
            // If the Auth Token is older than 24 hours, clear it
            if (authTokenCreatedAt.current && Date.now() - authTokenCreatedAt.current > 24 * 60 * 60 * 1000) {
                authToken.current = null;
                authTokenCreatedAt.current = null;
            }

            try {
                // Initial check to see if the user is already logged in
                if (authToken.current && (await api.login(authToken.current))) {
                    ui.showLoginPage = false;
                }
                loading = false;
            } catch (err) {
                loading = false;
            }
        })();
    });

    // Effect to watch for changes in ui.showLoginPage
    $effect(() => {
        if (!ui.showLoginPage) {
            (async () => {
                partitions.partitions = await api.fetchPartitions();
                tasks.tasks = await api.fetchTasks();
                setInterval(refreshTasks, 5000); // Refresh every 5 seconds

                if (activeUploads.current) {
                    activeUploads.current.forEach((upload) => {
                        if (getUploadProgress(upload).status === "SUCCESS") {
                            activeUploads.current = activeUploads.current.filter((u) => u !== upload); // Remove completed uploads
                        }
                    });
                }
            })();
        }
    });
</script>

{#if loading}
    <!-- Loading screen -->
    <div class="flex h-screen w-screen flex-col space-y-4 justify-center items-center">
        <span> Loading... </span>
        <PartialCircle className="animate-spin fill-pink-500 size-32" />
    </div>
{:else if ui.showLoginPage}
    <!-- Login screen -->
    <Login />
{:else}
    <!-- Main app screen -->
    {#if ui.showUploadModal}
        <UploadModal />
    {/if}

    <div class="flex h-screen flex-col">
        <Header />

        <main class="m-4 h-full overflow-scroll rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
            {@render children()}
        </main>
    </div>
{/if}
