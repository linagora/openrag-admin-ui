<script lang="ts">
    /**
     * This file represents the "file" view.
     * It displays all the metadata about a single file,
     * and allows the user to view the different extracts of the file.
     * @author Ulysse Bouchet for LINAGORA
     */

    // Utilities
    import { tick } from "svelte";
    import { marked } from "marked";
    import { formatDate } from "$lib/utils";
    import * as api from "$lib/api";

    // Stores
    import { indexerData } from "$lib/states.svelte";

    // Components
    import ExtractModal from "$lib/components/indexer/ExtractModal.svelte";

    // Icons
    import File from "$lib/icons/File.svelte";
    import ChevronDown from "$lib/icons/ChevronDown.svelte";
    import Expand from "$lib/icons/Expand.svelte";

    // Types
    import type { RAGExtract } from "$lib/types";

    // Properties
    let selectedExtract: string | null = $state(null); // The currently selected document
    let selectedExtractContent: RAGExtract | null = $state(null); // The content of the selected document
    let extractContainer: HTMLDivElement | null = $state(null);
    let showExtractModal = $state(false);

    /**
     * Select a new extract to display to the user.
     * @param extract The id of the extract to display
     */
    async function selectExtract(extract: string) {
        selectedExtractContent = await api.fetchExtract(extract);

        if (selectedExtractContent) selectedExtract = extract;
        await tick(); // Wait for DOM to update

        // Display the extract && scroll to top
        const extractDiv = document.getElementById("extract-content");
        if (extractDiv && extractContainer) {
            extractDiv.innerHTML = await marked.parse(selectedExtractContent.page_content);
            extractContainer.scrollTop = 0;
        }
    }

    async function openExtractModal() {
        showExtractModal = true;
        await tick(); // Wait for DOM to update

        const extractDiv = document.getElementById("extract-full");
        if (selectedExtractContent && extractDiv) {
            extractDiv.innerHTML = await marked.parse(selectedExtractContent.page_content);
        }
    }
</script>

{#if showExtractModal}
    <ExtractModal bind:showExtractModal {selectedExtract} />
{/if}

{#if indexerData.currentFile && indexerData.currentFile.documents}
    <div class="p4 flex h-full max-h-full divide-x divide-slate-200">
        <div class="flex w-128 flex-col">
            <span class="top-0 w-full border-b border-slate-200 bg-white px-4 py-2 font-bold"> File metadata </span>
            <div class="flex max-h-full flex-col overflow-y-auto p-4 text-sm">
                <span class="mb-4 self-center font-bold">Basic metadata</span>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">File ID</span>
                    <span>{indexerData.currentFile.metadata.file_id}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Filename</span>
                    <span>{indexerData.currentFile.metadata.filename}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Partition</span>
                    <span>{indexerData.currentFile.metadata.partition}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Source</span>
                    <span>{indexerData.currentFile.metadata.source}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Created</span>
                    <span>{formatDate(indexerData.currentFile.metadata.created_at)}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Size</span>
                    <span>{indexerData.currentFile.metadata.file_size}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Page</span>
                    <span>{indexerData.currentFile.metadata.page}</span>
                </div>
                {#if Object.entries(indexerData.currentFile.metadata).length > 7}
                    <div class="mx-4 my-4 border-t border-slate-200"></div>
                    <span class="mb-4 self-center font-bold">Additional metadata</span>
                    {#each Object.entries(indexerData.currentFile.metadata) as [key, value]}
                        {#if !["file_id", "filename", "partition", "source", "page", "file_size", "created_at"].includes(key)}
                            <div class="mb-2 flex flex-col space-y-1">
                                <span class="font-bold">{key}</span>
                                <span>{value}</span>
                            </div>
                        {/if}
                    {/each}
                {/if}
            </div>
        </div>
        <div class="flex flex-col">
            <span class="top-0 w-full border-b border-slate-200 bg-white px-4 py-2 text-center font-bold">
                Extracts ({indexerData.currentFile.documents.length})
            </span>
            <div class="flex max-h-full flex-col items-center divide-y divide-slate-200 overflow-y-auto">
                {#each indexerData.currentFile.documents as document}
                    <button
                        class="group flex w-full cursor-pointer items-center justify-center space-x-2 px-4 py-2 {document.link
                            .split('/')
                            .pop() === selectedExtract
                            ? 'bg-slate-50 font-bold '
                            : 'hover:bg-slate-50 '}"
                        onclick={() => selectExtract(document.link.split("/").pop() || "")}
                    >
                        <File className="fill-linagora-500 size-6" />
                        <span class="group-hover: text-sm">
                            {document.link.split("/").pop()}
                        </span>
                        <ChevronDown
                            className="-rotate-90 size-4 stroke-2 {document.link.split('/').pop() === selectedExtract
                                ? 'stroke-slate-500 stroke-3'
                                : 'group-hover:stroke-slate-500 stroke-transparent'}"
                        />
                    </button>
                {/each}
            </div>
        </div>

        <div class="flex w-7/12 max-w-7/12 flex-col">
            <div class="relative flex items-center justify-center bg-white border-b border-slate-200">
                <span class="px-4 py-2 text-center font-bold"> Preview </span>
                {#if selectedExtract}
                    <button onclick={openExtractModal} class="absolute right-3 cursor-pointer">
                        <Expand className="size-6 p-1 rounded-full hover:bg-slate-100" />
                    </button>
                {/if}
            </div>
            <div bind:this={extractContainer} class="flex h-full flex-col items-center overflow-y-auto">
                {#if !selectedExtract}
                    <span class="my-auto text-slate-500"> Select an extract to preview its content. </span>
                {:else}
                    <div
                        class="prose prose-pre:max-w-full w-full max-w-full p-8 text-sm wrap-anywhere"
                        id="extract-content"
                    ></div>
                {/if}
            </div>
        </div>
    </div>
{/if}
