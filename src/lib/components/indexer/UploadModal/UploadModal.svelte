<script lang="ts">
    /**
     * This file represents the file upload modal.
     * It allows the user to select a partition, some files, and other data to upload one or multiple files.
     * @author Ulysse Bouchet for LINAGORA
     */

    // Utilities
    import { onMount } from "svelte";
    import { v4 as uuidv4 } from "uuid";
    import * as api from "$lib/api";

    // States & persisted states
    import { ui, indexerData } from "$lib/states.svelte";
    import { activeUploads } from "$lib/persisted.svelte";

    // Components
    import PartitionInput from "$lib/components/indexer/UploadModal/PartitionInput.svelte";
    import Pip from "$lib/components/ui/Pip.svelte";

    // Icons
    import Upload from "$lib/icons/Upload.svelte";
    import Close from "$lib/icons/Close.svelte";
    import ChevronDown from "$lib/icons/ChevronDown.svelte";
    import File from "$lib/icons/File.svelte";
    import PartialCircle from "$lib/icons/PartialCircle.svelte";

    // Types
    import type { ActiveUpload, RAGPartition } from "$lib/types";

    // Form properties
    let selectedPartition: RAGPartition | null = $state(null);
    let files: FileList | undefined = $state();
    let metadata: string | undefined = $state();

    // UI properties
    let showDropdown = $state(false);
    let uploading = $state(false);

    // UI elements
    let dropdownRef: HTMLDivElement | undefined = $state();
    let partitionLabelRef: HTMLLabelElement | undefined = $state();
    let partitionButtonRef: HTMLButtonElement | undefined = $state();

    /**
     * Upload the file(s) to a partition and close the modal once done.
     */
    async function uploadFiles() {
        if (!files) {
            alert("No file(s) specified.");
            return;
        }
        if (!selectedPartition || selectedPartition === null) {
            alert("No partition selected.");
            return;
        }

        uploading = true;
        try {
            const newActiveTask: ActiveUpload = {
                partition: selectedPartition.partition,
                file_ids: [],
            };

            // Upload all the files
            for (const file of files) {
                const fileID = uuidv4();

                await api.addFile(file, selectedPartition.partition, fileID, metadata);
                newActiveTask.file_ids.push(fileID);
            }

            indexerData.tasks = await api.fetchTasks(); // Refresh tasks
            console.log("Created a new active task :", newActiveTask);
            activeUploads.current = [...activeUploads.current, newActiveTask]; // Add to active tasks

            files = undefined;
            closeUploadModal();
        } catch (error) {
            console.error("Error uploading file(s) :", error);
        }
        uploading = false;
    }

    /**
     * Locally create a partition before uploading, actualizing on input
     * @param event The event fired by the input
     */
    function createNewPartition(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.value === "") {
            selectedPartition = indexerData.partitions[0];
        } else {
            selectedPartition = { partition: input.value, created_at: "-1", file_count: -1 };
        }
    }

    /**
     * Closes the upload modal (and the dropdown, so it's not opened when the modal appears again)
     */
    function closeUploadModal() {
        if (files && !confirm("You have unsaved changes. Are you sure you want to close the modal?")) return;

        ui.showUploadModal = false;
        showDropdown = false;
    }

    /**
     * Close the dropdown when clicking outside of it
     */
    function closeDropdown(event: MouseEvent) {
        if (
            showDropdown &&
            dropdownRef &&
            !dropdownRef.contains(event.target as Node) &&
            partitionButtonRef &&
            !partitionButtonRef.contains(event.target as Node) &&
            partitionLabelRef &&
            !partitionLabelRef.contains(event.target as Node)
        ) {
            showDropdown = false;
        }
    }

    /**
     * Toggles the dropdown opened and closed
     */
    function togglePartitionDropdown() {
        showDropdown = !showDropdown;
    }

    /**
     * Handle key events for the modal
     * Escape : closes the modal
     * @param event the KeyboardEvent
     */
    function handleKeyboardShortcuts(event: KeyboardEvent) {
        if (event.key === "Escape") closeUploadModal();
    }

    // When the component is first initialised
    onMount(() => {
        selectedPartition = indexerData.currentPartition.partition ?? indexerData.partitions[0];

        // Add event listeners for keydown and outside clicks
        window.addEventListener("keydown", handleKeyboardShortcuts);
        document.addEventListener("click", closeDropdown);

        // Cleanup event listeners on component destruction
        return () => {
            window.removeEventListener("keydown", handleKeyboardShortcuts);
            document.removeEventListener("click", closeDropdown);
        };
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    class="absolute top-0 left-0 z-100 h-screen w-screen bg-slate-500/20 backdrop-blur-xs"
    onclick={closeUploadModal}
    role="dialog"
    tabindex="-1"
    aria-labelledby="upload-modal-title"
></div>

<!-- Upload modal -->
<div
    class="absolute top-1/2 left-1/2 z-100 -translate-x-1/2 -translate-y-1/2
    w-1/3 min-w-144 max-h-[90vh] flex flex-col overflow-hidden
    rounded-3xl bg-white shadow-lg"
>
    <!-- Modal title and close button -->
    <div class="flex justify-between fixed w-full bg-white z-10 p-6">
        <h1 id="upload-modal-title" class="text-xl font-semibold">Upload files</h1>

        <button
            onclick={closeUploadModal}
            class="flex aspect-square cursor-pointer items-center justify-center rounded-full p-1 hover:bg-slate-100"
            aria-label="Close upload modal"
        >
            <Close className="size-4 stroke-3" />
        </button>
    </div>

    <div class="mt-12 mb-20 p-6 space-y-4 flex flex-col overflow-y-scroll">
        <!-- Partition selection -->
        <div class="relative flex flex-col">
            <label
                bind:this={partitionLabelRef}
                class="mb-2 flex cursor-pointer items-center space-x-2 font-medium"
                for="partition-btn"
            >
                <span>
                    {indexerData.partitions.length === 0 ? "Create a partition" : "Select or create a partition"}
                </span>

                {#if selectedPartition?.file_count === -1}
                    <Pip text="New" />
                {/if}
            </label>

            {#if indexerData.partitions.length !== 0}
                <!-- Partition selection dropdown -->
                <button
                    bind:this={partitionButtonRef}
                    id="partition-btn"
                    class="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 px-4 py-2
				hover:border-slate-300 hover:bg-slate-50
				{showDropdown ? 'focus:border-slate-400 focus:bg-slate-100 focus:outline-none ' : ''}"
                    onclick={togglePartitionDropdown}
                    aria-haspopup="listbox"
                    aria-expanded={showDropdown}
                >
                    <span class="flex items-center space-x-2">
                        <span>
                            {selectedPartition?.partition}
                        </span>
                        {#if selectedPartition?.file_count === -1}
                            <Pip text="new" />
                        {/if}
                    </span>

                    <ChevronDown className="size-4 stroke-2 stroke-slate-500   {showDropdown ? 'rotate-180' : ''}" />
                </button>

                {#if showDropdown}
                    <div bind:this={dropdownRef} class="absolute top-full left-0 z-50 w-full">
                        <PartitionInput bind:selectedPartition onSelect={() => (showDropdown = false)} />
                    </div>
                {/if}
            {:else}
                <!-- Create partition input -->
                <input
                    id="partition-btn"
                    class="w-full cursor-pointer rounded-2xl border border-slate-200 px-4 py-2 text-left
				 placeholder:text-linagora-500 hover:border-slate-300 hover:bg-slate-50
				focus:cursor-text focus:border-slate-400 focus:bg-slate-100 focus:outline-none focus:placeholder:text-slate-400"
                    type="text"
                    placeholder="+ Add a new partition"
                    oninput={createNewPartition}
                />
            {/if}
        </div>

        <!-- Files upload input -->
        <div class="relative flex flex-col">
            <label class="mb-2 cursor-pointer font-medium" for="file-upload-btn"> Select one or multiple files </label>

            <label
                class="group cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 px-4 py-6
			hover:border-linagora-300 hover:bg-linagora-50/30 focus:outline-none"
                for="file-upload-btn"
            >
                {#if files}
                    {#if files.length === 1}
                        <!-- Display file name -->
                        <div class="flex items-center gap-2">
                            <File className="size-5 stroke-2 fill-linagora-500 stroke-linagora-500" />
                            <span class="text-slate-700 group-hover:text-linagora-500">
                                {files[0].name.split(".")[0]}
                            </span>
                        </div>
                    {:else if files && files?.length > 1}
                        <!-- Display file list with count -->
                        <div class="flex max-h-60 flex-col gap-2 overflow-y-scroll">
                            <span class="text-xs text-slate-500 group-hover:text-linagora-400">
                                {files.length} files selected :
                            </span>
                            {#each files as file}
                                <div class="flex items-center gap-2">
                                    <File className="size-5 stroke-2 fill-linagora-500 stroke-linagora-500" />
                                    <span class="text-slate-700 group-hover:text-linagora-500">
                                        {file.name.split(".")[0]}
                                    </span>
                                </div>
                            {/each}
                        </div>
                    {/if}
                {:else}
                    <!-- Display file upload button button -->
                    <div class="flex flex-col items-center justify-center">
                        <Upload className="size-10 stroke-2 stroke-slate-500  group-hover:stroke-linagora-500 mb-2" />
                        <p class="text-slate-500 group-hover:text-linagora-500">Click to browse files</p>
                    </div>
                {/if}
            </label>

            <input id="file-upload-btn" type="file" accept=".pdf" multiple bind:files class="hidden" />
        </div>

        {#if files}
            <!-- File metadata -->
            <div class="relative flex flex-col">
                <label class="mb-2 cursor-pointer font-medium" for="file-metadata-input">
                    {files.length === 1 ? "Metadata" : "Add metadata common to every file"}
                </label>
                <textarea
                    id="file-metadata-input"
                    placeholder="&#123; &quot;key&quot;: &quot;value&quot; &#125;"
                    bind:value={metadata}
                    class="min-h-32 rounded-2xl border border-slate-200 px-4 py-2 placeholder:text-slate-400
				hover:cursor-text hover:border-slate-300 hover:bg-slate-50
				focus:border-slate-400 focus:bg-slate-100 focus:outline-none"
                ></textarea>
            </div>
        {/if}
    </div>

    <!-- Cancel and Upload buttons -->
    <div class="fixed bottom-0 z-20 w-full flex justify-end space-x-4 px-6 pt-4 pb-6 bg-white">
        <button
            class="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-500 hover:bg-slate-50 focus:border-slate-300 focus:outline-none"
            onclick={closeUploadModal}
        >
            Cancel
        </button>

        <button
            class="flex cursor-pointer items-center gap-2 rounded-2xl border-none bg-linagora-500 px-4 py-2 font-semibold text-white
			hover:bg-linagora-600 focus:border-linagora-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-linagora-300"
            onclick={uploadFiles}
            disabled={!files || !selectedPartition || uploading}
        >
            {#if uploading}
                <PartialCircle className="size-5 stroke-3 animate-spin fill-white" /> Uploading...
            {:else}
                <Upload className="size-5 stroke-3" />
                Upload File
            {/if}
        </button>
    </div>
</div>
