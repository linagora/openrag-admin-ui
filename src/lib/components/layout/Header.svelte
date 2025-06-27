<script lang="ts">
    /**
     * This file corresponds to the header component of the application.
     * It displays the current partition and file, provides a button to upload files,
     * and allows the user to lock access by clearing the Auth Token.
     * @author Ulysse Bouchet for LINAGORA
     */

    // States, persisted states, and cookies
    import { files, partitions, ui } from "$lib/states.svelte";
    import { authToken, authTokenCreatedAt } from "$lib/persisted.svelte";

    // Icons
    import ChevronDown from "$lib/icons/ChevronDown.svelte";
    import Upload from "$lib/icons/Upload.svelte";
    import Home from "$lib/icons/Home.svelte";
    import Lock from "$lib/icons/Lock.svelte";

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
        <a href="/" class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100">
            <Home className="size-6 stroke-pink-500 fill-transparent" /> RAGondin Indexer
        </a>
        {#if partitions.currentPartition}
            <ChevronDown className="size-4 -rotate-90 stroke-3 stroke-pink-500" />
            <a
                href="/partition/{partitions.currentPartition.partition}"
                class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100"
            >
                {partitions.currentPartition.partition}
            </a>
        {/if}
        {#if files.currentFile}
            <ChevronDown className="size-4 -rotate-90 stroke-3 stroke-pink-500" />
            <span class="px-2">
                {files.currentFile}
            </span>
        {/if}
    </div>

    <!-- Action buttons -->
    <div class="flex items-center space-x-4">
        <!-- Lock access to the indexer -->
        <button
            class="cursor-pointer group flex items-center gap-2 rounded-xl border-none px-4 py-2 hover:bg-slate-100 transition-colors font-medium text-slate-500 hover:text-slate-900"
            onclick={() => {
                authTokenCreatedAt.current = null; // Clear the Auth Token creation time
                authToken.current = null; // Clear the Auth Token
                window.location.reload(); // Reload the page to reset the state
            }}
        >
            <Lock className="size-5 fill-slate-500 transition-colors group-hover:fill-slate-900" />
            Lock access
        </button>

        <!-- Upload files -->
        <button
            class="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-pink-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-pink-600 focus:outline-none"
            onclick={openUploadModal}
        >
            <Upload className="size-5 stroke-3" /> Upload files
        </button>
    </div>
</header>
