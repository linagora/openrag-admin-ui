<script lang="ts">
    /**
     * This file serves as the main page for the application.
     * It displays a list of partitions, allows users to select and delete them,
     * and shows all the upload tasks.
     * @author Ulysse Bouchet for LINAGORA
     */

    // Utilities
    import { onMount } from "svelte";
    import { formatDate, getUploadProgress, getStyleFromTaskState } from "$lib/utils";
    import * as api from "$lib/api";

    // States & persisted states
    import { partitions, tasks, files } from "$lib/states.svelte";
    import { activeUploads, displayMode } from "$lib/persisted.svelte";

    // Components
    import Checkbox from "$lib/components/ui/Checkbox.svelte";
    import TernaryCheckbox from "$lib/components/ui/TernaryCheckbox.svelte";
    import TaskCategoryDropdown from "$lib/components/TaskCategoryDropdown.svelte";

    // Icons
    import PartialCircle from "$lib/icons/PartialCircle.svelte";
    import Folder from "$lib/icons/Folder.svelte";
    import Trash from "$lib/icons/Trash.svelte";
    import List from "$lib/icons/List.svelte";
    import Grid from "$lib/icons/Grid.svelte";
    import Sort from "$lib/icons/Sort.svelte";

    // Types
    import type { RAGPartition } from "$lib/types";
    import type { TernaryCheckboxStatus } from "$lib/components/ui/TernaryCheckbox.svelte";

    // Partition selection properties
    let selectedPartitions: Set<RAGPartition> = $state(new Set()); // Track selected partitions
    let selectAllStatus: TernaryCheckboxStatus = $state("none"); // Compute ternary checkbox state

    // Sorting method for partitions, does not do anything by default
    let sortingMethod: (a: RAGPartition, b: RAGPartition) => number = $state((a, b) => {
        return 1 * invertedSorting;
    });
    let invertedSorting: 1 | -1 = $state(1);

    /**
     * Handles changing the partition sorting method.
     * @param event The event fired by the select element
     */
    function changeSortingMethod(event: Event) {
        const target = event.target as HTMLSelectElement;
        const method = target.value as "name" | "date" | "default";

        switch (method) {
            case "name":
                sortingMethod = (a: RAGPartition, b: RAGPartition) => {
                    return (a.partition.toLowerCase() < b.partition.toLowerCase() ? -1 : 1) * invertedSorting;
                };
                break;
            case "date":
                sortingMethod = (a: RAGPartition, b: RAGPartition) => {
                    return (a.created_at < b.created_at ? -1 : 1) * invertedSorting;
                };
                break;
            case "default":
            default:
                sortingMethod = (a: RAGPartition, b: RAGPartition) => {
                    return 1 * invertedSorting;
                };
                break;
        }
    }

    /**
     * Toggles a partition's selection status
     * @param partition the partition to toggle
     */
    function toggleSelect(partition: RAGPartition) {
        if (selectedPartitions.has(partition)) {
            selectedPartitions.delete(partition);
        } else {
            selectedPartitions.add(partition);
        }

        selectedPartitions = new Set(selectedPartitions); // Force refresh
    }

    /**
     * Select or unselect all partitions
     * @param state
     */
    function toggleSelectAll() {
        if (selectAllStatus === "full") {
            // Unselect all partitions
            selectedPartitions.clear();
            selectedPartitions = new Set(selectedPartitions); // Force refresh
        } else {
            // Select all partitions
            selectedPartitions = new Set(partitions.partitions);
        }
    }

    /**
     * Deletes a partition
     * @param partition the partition to delete
     */
    async function deletePartition(partition: RAGPartition) {
        const success = await api.deletePartition(partition.partition);
        if (success) {
            partitions.partitions = await api.fetchPartitions();
            selectedPartitions.delete(partition);
        }
    }

    /**
     * Deletes all the selected partitions
     */
    async function deleteAllSelectedPartitions() {
        if (
            confirm(
                `You are about to delete ${selectedPartitions.size} partitions.\nAre you sure you want to proceed ?`
            )
        )
            for (const partition of selectedPartitions) {
                await deletePartition(partition);
            }
    }

    $effect(() => {
        // Refresh selectAllStatus
        selectAllStatus =
            selectedPartitions.size === 0
                ? "none"
                : selectedPartitions.size === partitions.partitions.length
                  ? "full"
                  : "partial";
    });

    onMount(async () => {
        partitions.currentPartition = null;
        files.currentFile = null;
    });
</script>

<div class="flex h-full">
    <div class="relative flex grow flex-col overflow-y-auto">
        <!-- List header -->
        <div class="sticky top-0 z-20 flex items-center border-b border-slate-200 bg-white pl-4 pr-3">
            <!-- Partition selection -->
            <div class="flex items-center gap-3 py-3 grow">
                <TernaryCheckbox checked={selectAllStatus} onChange={toggleSelectAll} />
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <button onclick={toggleSelectAll} class="ml-2 cursor-pointer text-sm text-slate-600" tabindex="0">
                    {selectedPartitions.size} of {partitions.partitions.length} partitions selected
                </button>
            </div>

            <div class="flex items-center mr-3 pr-3 border-r border-slate-300">
                <!-- Sorting method -->
                <button
                    class="cursor-pointer rounded p-1 hover:bg-slate-100"
                    onclick={() => {
                        invertedSorting = invertedSorting === 1 ? -1 : 1;
                    }}
                >
                    <Sort className="size-5 fill-slate-500 {invertedSorting === -1 ? 'rotate-x-180' : ''}" />
                </button>
                <select
                    class="cursor-pointer rounded hover:bg-slate-100 py-1 px-2 text-sm text-slate-500 appearance-none"
                    onchange={changeSortingMethod}
                >
                    <option value="default">Default</option>
                    <option value="name">Name</option>
                    <option value="date">Date</option>
                </select>
            </div>

            <!-- Display mode -->
            <button
                class="cursor-pointer {displayMode.current === 'list' ? 'font-bold' : ''}"
                onclick={() => {
                    displayMode.current = "list";
                }}
            >
                <List
                    className="inline size-8 p-1 hover:bg-slate-100 rounded {displayMode.current === 'list'
                        ? 'fill-slate-500'
                        : 'fill-slate-300'}"
                />
            </button>
            <button
                class="cursor-pointer {displayMode.current === 'grid' ? 'font-bold' : ''}"
                onclick={() => {
                    displayMode.current = "grid";
                }}
            >
                <Grid
                    className="inline size-8 hover:bg-slate-100 p-1 rounded {displayMode.current === 'grid'
                        ? 'fill-slate-500'
                        : 'fill-slate-300'}"
                />
            </button>
        </div>

        <!-- No partitions -->
        {#if partitions.partitions.length === 0}
            <div class="flex h-full w-full items-center justify-center">
                <span class="text-center text-sm text-slate-500">
                    No partitions available. Please wait a bit for the partitions to be fetched, or start indexing files
                    now.
                </span>
            </div>
        {:else if displayMode.current === "list"}
            <!-- Partition list -->
            <div class="flex flex-col">
                {#each partitions.partitions.toSorted(sortingMethod) as partition}
                    <div class="group flex items-center space-x-4 border-b border-slate-200 px-4 hover:bg-slate-100">
                        <Checkbox
                            checked={selectedPartitions.has(partition)}
                            onChange={() => toggleSelect(partition)}
                        />
                        <a href="/partition/{partition.partition}" class="flex w-full items-center space-x-3 py-4">
                            <Folder className="size-6 fill-linagora-500 stroke-3" />
                            <span class="grow">{partition.partition}</span>
                            <span class="text-xs text-slate-500">
                                Created: {formatDate(partition.created_at)}
                            </span>
                        </a>
                        <button
                            onclick={() => deletePartition(partition)}
                            aria-label={`Delete partition ${partition.partition}`}
                        >
                            <Trash
                                className="size-7 fill-transparent stroke-red-300 hover:stroke-red-500 cursor-pointer rounded p-1 hover:bg-red-100/75"
                            />
                        </button>
                    </div>
                {/each}
            </div>
        {:else}
            <!-- Partition grid -->
            <div class="grid {tasks.tasks.length > 0 ? 'grid-cols-6' : 'grid-cols-8'} gap-4 p-4">
                {#each partitions.partitions.toSorted(sortingMethod) as partition}
                    <div
                        class="group relative rounded-lg border border-slate-200 bg-white p-2 shadow-md hover:shadow-lg"
                    >
                        <Checkbox
                            checkboxClasses="absolute self-start top-1 left-1 z-10"
                            checked={selectedPartitions.has(partition)}
                            onChange={() => toggleSelect(partition)}
                        />
                        <button
                            class="absolute top-1.5 right-1.5 z-10"
                            onclick={() => deletePartition(partition)}
                            aria-label={`Delete partition ${partition.partition}`}
                        >
                            <Trash
                                className="size-7 fill-transparent stroke-red-300 hover:stroke-red-500 cursor-pointer rounded p-0.5 hover:bg-red-50"
                            />
                        </button>
                        <a
                            href="/partition/{partition.partition}"
                            class="flex h-full flex-col items-center py-4 text-center"
                        >
                            <Folder className="size-12 fill-linagora-500 stroke-3" />
                            <span class="grow font-bold">{partition.partition}</span>
                            <span class="mb-1 text-xs text-slate-500">
                                Created: {formatDate(partition.created_at)}
                            </span>
                        </a>
                    </div>
                {/each}
            </div>
        {/if}

        <!-- Empty growing div to ensure footer is at the bottom -->
        <div class="grow"></div>

        <!-- Delete all selected partitions footer -->
        {#if selectedPartitions.size > 0}
            <footer
                class="sticky bottom-0 left-0 z-10 flex w-full items-center justify-between border-t border-slate-200 bg-white p-4"
            >
                <span class="text-slate-600">
                    {selectedPartitions.size} partition{selectedPartitions.size > 1 ? "s" : ""} selected
                </span>
                <button
                    class="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600 focus:outline-none"
                    onclick={deleteAllSelectedPartitions}
                >
                    <Trash className="size-5 fill-transparent stroke-white" /> Delete selected
                </button>
            </footer>
        {/if}
    </div>

    {#if tasks.tasks.length > 0}
        <!-- Current tasks -->
        <div class="flex w-96 min-w-96 flex-col border-l border-slate-200">
            <span
                class="flex font-bold items-center justify-center border-b border-slate-200 bg-white py-3 text-sm text-slate-600"
            >
                Tasks
            </span>

            {#if activeUploads.current.length > 0}
                <div class="border-b divide-y divide-slate-200 border-slate-200">
                    {#each activeUploads.current as activeTask}
                        {@const progress = getUploadProgress(activeTask)}
                        <div class="bg-white px-4 py-3 space-y-1 flex flex-col">
                            <span class="text-xs">
                                {#if progress.status === "SUCCESS"}
                                    {`${activeTask.file_ids.length} file(s) uploaded to partition "${activeTask.partition}".`}
                                {:else if progress.status === "FAILED"}
                                    {`Upload failed for ${activeTask.file_ids.length} file(s) to partition "${activeTask.partition}".`}
                                {:else}
                                    {`Uploading ${activeTask.file_ids.length} file(s) to partition "${activeTask.partition}"... (${activeTask.file_ids.length - progress.completedFiles} left)`}
                                {/if}
                            </span>
                            <div class="flex items-center space-x-2">
                                <div class="relative h-1 w-full bg-slate-200 rounded-full">
                                    <div
                                        style="width: {progress.progress}%;"
                                        class="absolute h-1 bg-linagora-500 rounded-full"
                                    ></div>
                                </div>
                                <span class="text-[0.7rem] text-right w-6">
                                    {progress.progress}%
                                </span>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
            <div
                class="sticky top-0 z-10 flex w-full items-center justify-center space-x-1 border-b shadow border-slate-200 bg-slate-100 py-2"
            >
                <span class="text-xs font-semibold text-slate-500">
                    ACTIVE ({tasks.tasks.filter(
                        (task) => task.state === "SERIALIZING" || task.state === "CHUNKING" || task.state == "INSERTING"
                    ).length})
                </span>
            </div>
            <div class="h-full min-h-96 divide-y divide-slate-200 overflow-y-auto">
                {#each tasks.tasks.filter((task) => task.state !== "COMPLETED" && task.state !== "FAILED" && task.state !== "QUEUED") as task}
                    <div
                        class="flex flex-col space-y-1 space-x-2 overflow-x-hidden border-b border-slate-200 px-4 py-3 break-all"
                    >
                        <div class="flex items-center space-x-1">
                            <Folder className="size-4 fill-linagora-500" />
                            <span class="text-xs text-slate-500">{task.details.partition}</span>
                        </div>
                        <span class="text-sm">{task.details.file_id}</span>
                        <div class="mt-1 flex items-center space-x-2 self-end">
                            <span class="text-xs font-bold {getStyleFromTaskState(task.state)}">
                                {task.state}
                            </span>
                            <PartialCircle className="inline size-3 stroke-5 fill-blue-500 animate-spin" />
                        </div>
                    </div>
                {/each}
            </div>
            <!-- Queued tasks -->
            <TaskCategoryDropdown
                category="QUEUED"
                opened={tasks.tasks.filter((task) => task.state === "QUEUED").length > 0}
            />

            <!-- Completed tasks -->
            <TaskCategoryDropdown category="COMPLETED" />

            <!-- Failed tasks -->
            <TaskCategoryDropdown category="FAILED" />
        </div>
    {/if}
</div>
