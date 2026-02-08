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
    import File from "$lib/icons/File.svelte";

    /**
     * Check if the quota is infinite (-1 from backend means infinite)
     */
    let isQuotaInfinite = $derived(
        indexerData.userInfo?.file_quota === -1
    );

    /**
     * Check if uploads are disabled (quota reached and quota is not infinite)
     */
    let uploadsDisabled = $derived(
        indexerData.userInfo &&
        !isQuotaInfinite &&
        indexerData.userInfo.total_files >= indexerData.userInfo.file_quota
    );

    /**
     * Check if quota is exceeded (for styling)
     */
    let quotaExceeded = $derived(
        indexerData.userInfo &&
        !isQuotaInfinite &&
        indexerData.userInfo.total_files >= indexerData.userInfo.file_quota
    );

    /**
     * Opens the upload modal
     */
    function openUploadModal() {
        if (uploadsDisabled) return;
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

    <!-- Action buttons and user info -->
    <div class="flex items-center space-x-4">
        <!-- User file quota info -->
        {#if indexerData.userInfo}
            <div class="flex items-center gap-4 text-base text-slate-600 border-r border-slate-300 pr-4">
                <File className="size-6 fill-slate-400" />
                <div class="flex flex-col">
                    <span class="text-sm text-slate-400">Files</span>
                    <span class="font-semibold text-lg">
                        {indexerData.userInfo.file_count} indexed
                        {#if indexerData.userInfo.pending_files > 0}
                            <span class="text-amber-500">+ {indexerData.userInfo.pending_files} pending</span>
                        {/if}
                    </span>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm text-slate-400">Quota</span>
                    <span class="font-semibold text-lg {quotaExceeded ? 'text-red-500' : ''}">
                        {indexerData.userInfo.total_files} / {isQuotaInfinite ? '∞' : indexerData.userInfo.file_quota}
                    </span>
                </div>
            </div>
        {/if}

        <!-- Upload files -->
        <button
            class="flex items-center gap-2 rounded-2xl border-none px-4 py-2 font-semibold text-white focus:outline-none
                {uploadsDisabled
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-linagora-500 hover:bg-linagora-600 cursor-pointer'}"
            onclick={openUploadModal}
            disabled={uploadsDisabled}
            title={uploadsDisabled ? 'File quota reached' : ''}
        >
            <Upload className="size-5 stroke-3" /> Upload files
        </button>
    </div>
</header>
