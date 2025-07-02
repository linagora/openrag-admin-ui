<script lang="ts">
    // Utilities
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import * as api from "$lib/api";

    // States & persisted states
    import { files as filesState, partitions } from "$lib/states.svelte";
    import { displayMode } from "$lib/persisted.svelte";

    // Components
    import Checkbox from "$lib/components/ui/Checkbox.svelte";
    import TernaryCheckbox from "$lib/components/ui/TernaryCheckbox.svelte";

    // Icons
    import File from "$lib/icons/File.svelte";
    import Trash from "$lib/icons/Trash.svelte";
    import Grid from "$lib/icons/Grid.svelte";
    import List from "$lib/icons/List.svelte";
    import Sort from "$lib/icons/Sort.svelte";

    // Types
    import type { RAGFileInList } from "$lib/types";
    import type { TernaryCheckboxStatus } from "$lib/components/ui/TernaryCheckbox.svelte";

    // Properties
    let files = $state<RAGFileInList[]>([]); // Files in the current partition

    // File selection properties
    let selectedFiles: Set<RAGFileInList> = $state(new Set()); // Track selected files
    let selectAllStatus: TernaryCheckboxStatus = $state("none"); // Compute ternary checkbox state

    // Sorting method for files, does not do anything by default
    let sortingMethod: (a: RAGFileInList, b: RAGFileInList) => number = $state((a, b) => {
        return 1 * invertedSorting;
    });
    let invertedSorting: 1 | -1 = $state(1);

    /**
     * Handles changing the file sorting method.
     * @param event The event fired by the select element
     */
    function changeSortingMethod(event: Event) {
        const target = event.target as HTMLSelectElement;
        const method = target.value as "id" | "default";

        switch (method) {
            case "id":
                sortingMethod = (a: RAGFileInList, b: RAGFileInList) => {
                    return (a.link.toLowerCase() < b.link.toLowerCase() ? -1 : 1) * invertedSorting;
                };
                break;
            case "default":
            default:
                sortingMethod = (a: RAGFileInList, b: RAGFileInList) => {
                    return 1 * invertedSorting;
                };
                break;
        }
    }

    /**
     * Toggles a file's selection status
     * @param file the file to toggle
     */
    const toggleSelect = (file: RAGFileInList) => {
        if (selectedFiles.has(file)) {
            selectedFiles.delete(file);
        } else {
            selectedFiles.add(file);
        }

        selectedFiles = new Set(selectedFiles); // Force refresh
    };

    /**
     * Select or unselect all files
     * @param state
     */
    const toggleSelectAll = () => {
        if (selectAllStatus === "full") {
            // Unselect all files
            selectedFiles.clear();
            selectedFiles = new Set(selectedFiles); // Force refresh
        } else {
            // Select all files
            selectedFiles = new Set(files);
        }
    };

    const refreshFileList = async () => {
        if (!partitions.currentPartition?.partition) {
            console.log("No partition found, redirecting to partition list.");
            goto("/");
            return;
        }

        try {
            files = await api.fetchFilesFromPartition(partitions.currentPartition.partition);
            if (files.length === 0) {
                partitions.partitions = await api.fetchPartitions();
                // If no files left, redirect to the partition list
                goto("/");
            }
        } catch (error: any) {
            if (error.message.includes("404")) {
                // A 404 error indicates that the partition has been deleted since no files are left
                console.log("No partition found, redirecting to partition list.");
                partitions.partitions = await api.fetchPartitions();
                goto("/");
            } else console.error("Error fetching files:", error);
        }
    };

    /**
     * Deletes a file
     * @param file the file to delete
     */
    const deleteFile = async (file: RAGFileInList) => {
        if (partitions.currentPartition?.partition) {
            const link: string | undefined = file.link.split("/").pop();
            if (link) {
                const success: boolean = await api.deleteFile(partitions.currentPartition?.partition, link);
                if (success) {
                    selectedFiles.delete(file);
                    refreshFileList();
                }
            }
        }
    };

    /**
     * Deletes all the selected files
     */
    const deleteAllSelectedFiles = async () => {
        if (confirm(`You are about to delete ${selectedFiles.size} files.\nAre you sure you want to proceed ?`))
            for (const file of selectedFiles) {
                await deleteFile(file);
            }
    };

    $effect(() => {
        // Refresh selectAllStatus
        selectAllStatus = selectedFiles.size === 0 ? "none" : selectedFiles.size === files.length ? "full" : "partial";
    });

    onMount(async () => {
        filesState.currentFile = null; // Reset current file

        if (!partitions.partitions || partitions.partitions.length === 0) {
            // Fetch partitions if not already fetched
            partitions.partitions = await api.fetchPartitions();
        }

        if (page.params.partition) {
            // Fetch the partition from the URL parameter
            const partition = page.params.partition;
            // Set the current partition in the store
            partitions.currentPartition = partitions.partitions.find((p) => p.partition === partition) || null;
        }

        refreshFileList();
    });
</script>

{#if files.length === 0}
    <div class="flex h-full items-center justify-center">
        <span class="text-sm text-slate-500">
            No files available. Please wait a bit for the files to be fetched, or start indexing files now.
        </span>
    </div>
{:else}
    <div class="relative flex h-full flex-col overflow-y-auto">
        <!-- List header -->
        <div class="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white">
            <div class="flex grow items-center gap-3 py-3 pl-4">
                <TernaryCheckbox checked={selectAllStatus} onChange={toggleSelectAll} />
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <button onclick={toggleSelectAll} class="ml-2 cursor-pointer text-sm text-slate-600" tabindex="0">
                    {selectedFiles.size} of {files.length} files selected
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
                    <option value="id">ID</option>
                </select>
            </div>
            <div class="flex items-center pr-3">
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
        </div>

        {#if displayMode.current === "list"}
            <!-- File list -->
            <div class="flex flex-col">
                {#each files.toSorted(sortingMethod) as file}
                    <div class="group flex items-center space-x-4 border-b border-slate-200 px-4 hover:bg-slate-100">
                        <Checkbox checked={selectedFiles.has(file)} onChange={() => toggleSelect(file)} />
                        <a
                            href="/partition/{partitions.currentPartition?.partition}/file/{file.link.split('/').pop()}"
                            class="flex w-full items-center space-x-3 py-4"
                        >
                            <File className="size-6 fill-linagora-500 stroke-3" />
                            <span class="grow">{file.link.split("/").pop()}</span>
                        </a>
                        <button onclick={() => deleteFile(file)} aria-label={`Delete file ${file.link}`}>
                            <Trash
                                className="size-8 fill-transparent stroke-red-500 hover:stroke-red-600 cursor-pointer rounded p-1 hover:bg-slate-200"
                            />
                        </button>
                    </div>
                {/each}
            </div>
        {:else}
            <!-- Partition grid -->
            <div class="grid grid-cols-8 gap-4 p-4">
                {#each files.toSorted(sortingMethod) as file}
                    <div
                        class="group relative rounded-lg border border-slate-200 bg-white p-2 shadow-md hover:shadow-lg"
                    >
                        <Checkbox
                            checkboxClasses="absolute self-start top-1 left-1 z-10"
                            checked={selectedFiles.has(file)}
                            onChange={() => toggleSelect(file)}
                        />
                        <button
                            class="absolute top-1.5 right-1.5 z-10"
                            onclick={() => deleteFile(file)}
                            aria-label={`Delete file ${file.link}`}
                        >
                            <Trash
                                className="size-7 fill-transparent stroke-red-500 hover:stroke-red-600 cursor-pointer rounded p-0.5 hover:bg-red-50"
                            />
                        </button>
                        <a
                            href="/partition/{partitions.currentPartition?.partition}/file/{file.link.split('/').pop()}"
                            class="flex h-full flex-col items-center py-4 text-center"
                        >
                            <File className="size-10 fill-linagora-500 stroke-3" />
                            <span
                                title={file.link.split("/").pop()}
                                class="mt-2 line-clamp-2 text-sm font-bold break-all"
                            >
                                {file.link.split("/").pop()}
                            </span>
                        </a>
                    </div>
                {/each}
            </div>
        {/if}

        <!-- Empty growing div to ensure footer is at the bottom -->
        <div class="grow"></div>

        <!-- Delete all selected files footer -->
        {#if selectedFiles.size > 0}
            <footer
                class="sticky bottom-0 left-0 z-10 flex w-full items-center justify-between border-t border-slate-200 bg-white p-4"
            >
                <span class="text-slate-600">
                    {selectedFiles.size} file{selectedFiles.size > 1 ? "s" : ""} selected
                </span>
                <button
                    class="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600 focus:outline-none"
                    onclick={deleteAllSelectedFiles}
                >
                    <Trash className="size-5 fill-transparent stroke-white" /> Delete selected
                </button>
            </footer>
        {/if}
    </div>
{/if}
