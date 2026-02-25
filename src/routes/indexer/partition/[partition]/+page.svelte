<script lang="ts">
    /**
     * This file represents the "partition" view.
     * It displays the files present in a partition, with options to sort or delete them.
     * @author Ulysse Bouchet for LINAGORA
     */

    // Utilities
    import { goto } from "$app/navigation";
    import { formatDate } from "$lib/utils";
    import * as api from "$lib/api";

    // States & persisted states
    import { indexerData } from "$lib/states.svelte";
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
        const method = target.value as "id" | "name" | "size" | "date" | "default";

        switch (method) {
            case "id":
                sortingMethod = (a: RAGFileInList, b: RAGFileInList) => {
                    return (a.file_id.toLowerCase() < b.file_id.toLowerCase() ? -1 : 1) * invertedSorting;
                };
                break;
            case "name":
                sortingMethod = (a: RAGFileInList, b: RAGFileInList) => {
                    return (a.filename.toLowerCase() < b.filename.toLowerCase() ? -1 : 1) * invertedSorting;
                };
                break;
            case "size":
                sortingMethod = (a: RAGFileInList, b: RAGFileInList) => {
                    return (a.file_size > b.file_size ? -1 : 1) * invertedSorting;
                };
                break;
            case "date":
                sortingMethod = (a: RAGFileInList, b: RAGFileInList) => {
                    return (a.created_at < b.created_at ? -1 : 1) * invertedSorting;
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
    function toggleSelect(file: RAGFileInList) {
        if (selectedFiles.has(file)) {
            selectedFiles.delete(file);
        } else {
            selectedFiles.add(file);
        }

        selectedFiles = new Set(selectedFiles); // Force refresh
    }

    /**
     * Select or unselect all files
     * @param state
     */
    function toggleSelectAll() {
        if (selectAllStatus === "full") {
            // Unselect all files
            selectedFiles.clear();
            selectedFiles = new Set(selectedFiles); // Force refresh
        } else {
            // Select all files
            selectedFiles = new Set(indexerData.currentPartition.files);
        }
    }

    /**
     * Deletes a file
     * @param file the file to delete
     */
    async function deleteFile(file: RAGFileInList) {
        if (indexerData.currentPartition?.partition) {
            const success: boolean = await api.deleteFile(indexerData.currentPartition.partition.partition, file.file_id);
            if (success) {
                selectedFiles.delete(file);
                refreshFileList();
            }
        }
    }

    /**
     * Deletes all the selected files
     */
    async function deleteAllSelectedFiles() {
        if (confirm(`You are about to delete ${selectedFiles.size} files.\nAre you sure you want to proceed ?`))
            for (const file of selectedFiles) await deleteFile(file);
    }

    /**
     * This function refreshes the file list of a partition after a deletion,
     * and redirects the user if the partition became empty.
     */
    async function refreshFileList() {
        if (!indexerData.currentPartition?.partition) {
            console.log("No partition found, redirecting to partition list.");
            goto("/");
            return;
        }

        try {
            indexerData.currentPartition.files = await api.fetchFilesFromPartition(indexerData.currentPartition.partition?.partition);
        } catch (error: any) {
            if (error.message.includes("404")) {
                // A 404 error indicates that the partition has been deleted since no files are left
                console.log("Partition is now empty and has been deleted, redirecting to partition list.");
                goto("/");
            } else console.error("Error refreshing files:", error);
        }
    }

    $effect(() => {
        // Refresh selectAllStatus
        selectAllStatus =
            selectedFiles.size === 0
                ? "none"
                : selectedFiles.size === indexerData.currentPartition.files.length
                  ? "full"
                  : "partial";
    });
</script>

{#if indexerData.currentPartition.files.length === 0}
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
                    {selectedFiles.size} of {indexerData.currentPartition.files.length} files selected
                </button>
            </div>

            <div class="flex items-center mr-3 pr-3 border-r border-slate-300">
                <!-- Sorting method -->
                <button
                    class="cursor-pointer rounded-xl p-1 hover:bg-slate-100"
                    onclick={() => {
                        invertedSorting = invertedSorting === 1 ? -1 : 1;
                    }}
                >
                    <Sort className="size-5 fill-slate-500 {invertedSorting === -1 ? 'rotate-x-180' : ''}" />
                </button>
                <select
                    class="cursor-pointer rounded-xl hover:bg-slate-100 py-1 px-2 text-sm text-slate-500 appearance-none"
                    onchange={changeSortingMethod}
                >
                    <option value="default">Default</option>
                    <option value="id">ID</option>
                    <option value="name">Name</option>
                    <option value="size">Size</option>
                    <option value="date">Date created</option>
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
                        className="inline size-8 p-1 hover:bg-slate-100 rounded-xl {displayMode.current === 'list'
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
                        className="inline size-8 hover:bg-slate-100 p-1 rounded-xl {displayMode.current === 'grid'
                            ? 'fill-slate-500'
                            : 'fill-slate-300'}"
                    />
                </button>
            </div>
        </div>

        {#if displayMode.current === "list"}
            <!-- File list -->
            <div class="flex flex-col">
                {#each indexerData.currentPartition.files.toSorted(sortingMethod) as file}
                    <div class="group flex items-center space-x-4 border-b border-slate-200 px-4 hover:bg-slate-50">
                        <Checkbox checked={selectedFiles.has(file)} onChange={() => toggleSelect(file)} />
                        <a
                            href="/indexer/partition/{indexerData.currentPartition?.partition?.partition}/file/{file.file_id}"
                            class="flex w-full items-center space-x-3 py-4"
                            title="id: {file.file_id}"
                        >
                            <File className="size-6 fill-linagora-500 stroke-3" />
                            <div class="grow relative flex items-center space-x-2">
                                <span>{file.filename}</span>
                                <span class="text-xs text-slate-500">
                                    {file.file_size}
                                </span>
                            </div>
                            <span class="text-xs text-slate-500">
                                Created: {formatDate(file.indexed_at)}
                            </span>
                        </a>
                        <button onclick={() => deleteFile(file)} aria-label={`Delete file ${file.file_id}`}>
                            <Trash
                                className="size-8 fill-transparent stroke-red-500 hover:stroke-red-600 cursor-pointer rounded-xl p-1 hover:bg-slate-200"
                            />
                        </button>
                    </div>
                {/each}
            </div>
        {:else}
            <!-- Partition grid -->
            <div class="grid grid-cols-8 gap-4 p-4">
                {#each indexerData.currentPartition.files.toSorted(sortingMethod) as file}
                    {@const selected = selectedFiles.has(file)}
                    <div class="group relative aspect-square">
                        <Checkbox
                            checkboxClasses="{selected
                                ? 'block'
                                : 'hidden group-hover:block'} absolute self-start top-3 left-3 z-10"
                            checked={selected}
                            onChange={() => toggleSelect(file)}
                        />
                        <button
                            class="hidden group-hover:block absolute top-2 right-2 z-10"
                            onclick={() => deleteFile(file)}
                            aria-label={`Delete file ${file.file_id}`}
                        >
                            <Trash
                                className="size-7 fill-transparent stroke-red-300 hover:stroke-red-500 cursor-pointer rounded-xl p-0.5 hover:bg-red-50"
                            />
                        </button>
                        <a
                            href="/indexer/partition/{indexerData.currentPartition?.partition?.partition}/file/{file.file_id}"
                            class="absolute w-full h-full top-0 left-0 flex flex-col items-center rounded-2xl border border-slate-200 bg-white shadow-md
                            hover:shadow-lg hover:bg-slate-50 p-2 text-center"
                            title="id: {file.file_id}"
                        >
                            <File className="mt-6 size-12 fill-linagora-500 stroke-3" />
                            <span class="font-bold">{file.filename}</span>
                            <span class="mt-0.5 text-xs text-slate-500">
                                {file.file_size}
                            </span>
                            <div class="grow"></div>
                            <span class="mb-1 text-xs text-slate-500">
                                {formatDate(file.created_at)}
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
                    class="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 focus:outline-none"
                    onclick={deleteAllSelectedFiles}
                >
                    <Trash className="size-5 fill-transparent stroke-white" /> Delete selected
                </button>
            </footer>
        {/if}
    </div>
{/if}
