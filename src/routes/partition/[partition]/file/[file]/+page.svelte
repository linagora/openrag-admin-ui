<script lang="ts">
    // Utilities
    import { onMount, tick } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { marked } from "marked";
    import * as api from "$lib/api";
    import { formatDate } from "$lib/utils";

    // Stores
    import { partitions, files } from "$lib/states.svelte";

    // Icons
    import File from "$lib/icons/File.svelte";
    import ChevronDown from "$lib/icons/ChevronDown.svelte";

    // Types
    import type { RAGExtract, RAGFile } from "$lib/types";

    // Properties
    let file: RAGFile | null = null; // The file to display
    let selectedExtract: string | null = null; // The currently selected document
    let selectedExtractContent: RAGExtract | null = null; // The content of the selected document

    const selectExtract = async (extract: string) => {
        selectedExtractContent = await api.fetchExtract(extract);

        if (selectedExtractContent) selectedExtract = extract;
        await tick(); // Wait for DOM to update

        const extractDiv = document.getElementById("extract-content");
        if (extractDiv) extractDiv.innerHTML = await marked.parse(selectedExtractContent.page_content);
    };

    onMount(async () => {
        if (!partitions.partitions || partitions.partitions.length === 0) {
            // Fetch partitions if not already fetched
            partitions.partitions = await api.fetchPartitions();
        }

        if (page.params.partition) {
            // Fetch the partition from the URL parameter
            const partition = page.params.partition;
            // Set the current partition in the store
            partitions.currentPartition =
                partitions.partitions.find((p) => p.partition === partition) || null;
        }

        if (page.params.file) {
            // Fetch the partition from the URL parameter
            const file = page.params.file;
            // Set the current partition in the store
            files.currentFile = file;
        }

        if (!partitions.currentPartition?.partition) {
            goto("/");
            return;
        } else if (!files.currentFile) {
            goto(`/partition/${partitions.currentPartition.partition}`);
            return;
        }

        file = await api.fetchFile(partitions.currentPartition?.partition, files.currentFile);
    });
</script>

{#if file && file.documents}
    <div class="p4 flex h-full max-h-full divide-x divide-slate-200">
        <div class="flex w-128 flex-col bg-slate-50">
            <span class="top-0 w-full border-b border-slate-200 bg-white px-4 py-2 font-bold"> File metadata </span>
            <div class="flex max-h-full flex-col overflow-y-auto p-4 text-sm">
                <span class="mb-4 self-center font-bold">Basic metadata</span>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">File ID</span>
                    <span>{file?.metadata.file_id}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Filename</span>
                    <span>{file?.metadata.filename}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Partition</span>
                    <span>{file?.metadata.partition}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Source</span>
                    <span>{file?.metadata.source}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Created</span>
                    <span>{formatDate(file?.metadata.created_at)}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Size</span>
                    <span>{file?.metadata.file_size}</span>
                </div>
                <div class="mb-2 flex flex-col space-y-1">
                    <span class="font-bold">Page</span>
                    <span>{file?.metadata.page}</span>
                </div>
                {#if Object.entries(file.metadata).length > 7}
                    <div class="mx-4 my-4 border-t border-slate-200"></div>
                    <span class="mb-4 self-center font-bold">Additional metadata</span>
                    {#each Object.entries(file.metadata) as [key, value]}
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
        <div class="flex flex-col bg-slate-50">
            <span class="top-0 w-full border-b border-slate-200 bg-white px-4 py-2 text-center font-bold">
                Extracts ({file.documents.length})
            </span>
            <div class="flex max-h-full flex-col items-center divide-y divide-slate-200 overflow-y-auto">
                {#each file?.documents as document}
                    <button
                        class="group flex w-full cursor-pointer items-center justify-center space-x-2 px-4 py-2 {document.link
                            .split('/')
                            .pop() === selectedExtract
                            ? 'bg-slate-100 font-bold '
                            : 'hover:bg-slate-100 '}"
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

        <div class="flex w-7/12 max-w-7/12 flex-col bg-slate-50">
            <span class="top-0 border-b border-slate-200 bg-white px-4 py-2 text-center font-bold"> Preview </span>
            <div class="flex h-full flex-col items-center divide-y divide-slate-200 overflow-y-auto">
                {#if !selectedExtract}
                    <span class="my-auto text-slate-500"> Select an extract to preview its content. </span>
                {:else}
                    <div
                        class="prose prose-pre:max-w-full w-full max-w-none bg-slate-100 p-8 text-sm"
                        id="extract-content"
                    ></div>
                {/if}
            </div>
        </div>
    </div>
{/if}
