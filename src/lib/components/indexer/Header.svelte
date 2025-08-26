<script lang="ts">
    /**
     * This file corresponds to the header component of the application.
     * It displays the current partition and file, provides a button to upload files,
     * and allows the user to lock access by clearing the Auth Token.
     * @author Ulysse Bouchet for LINAGORA
     */

    // States, persisted states, and cookies
    import { indexerData, ui } from "$lib/states.svelte";

    // Icons
    import ChevronDown from "$lib/icons/ChevronDown.svelte";
    import Upload from "$lib/icons/Upload.svelte";
    import FileStorage from "$lib/icons/FileStorage.svelte";

    /**
     * Opens the upload modal
     */
    function openUploadModal() {
        ui.showUploadModal = true;
    }
</script>

<header class="flex items-center justify-between p-4 pb-0">
    <!-- Navigation between files and partitions -->
    <div class="flex items-center space-x-2 text-xl font-bold">
        <a href="/indexer" class="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-100">
            <FileStorage className="size-6 fill-linagora-500" /> Indexer
        </a>
        {#if indexerData.currentPartition.partition}
            <ChevronDown className="size-4 -rotate-90 stroke-3 stroke-linagora-500" />
            <a
                href="/indexer/partition/{indexerData.currentPartition.partition.partition}"
                class="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-slate-100"
            >
                {indexerData.currentPartition.partition.partition}
            </a>
        {/if}
        {#if indexerData.currentFile}
            <ChevronDown className="size-4 -rotate-90 stroke-3 stroke-linagora-500" />
            <span class="px-2">
                {indexerData.currentFile.metadata.filename}
            </span>
        {/if}
    </div>

    <!-- Action buttons -->
    <div class="flex items-center space-x-4">
        <!-- Upload files -->
        <button
            class="flex cursor-pointer items-center gap-2 rounded-2xl border-none bg-linagora-500 px-4 py-2 font-semibold text-white hover:bg-linagora-600 focus:outline-none"
            onclick={openUploadModal}
        >
            <Upload className="size-5 stroke-3" /> Upload files
        </button>
    </div>
</header>
