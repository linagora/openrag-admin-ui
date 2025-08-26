<script lang="ts">
    /**
     * This file represents the file upload modal.
     * It allows the user to select a partition, some files, and other data to upload one or multiple files.
     * @author Ulysse Bouchet for LINAGORA
     */

    // Import states
    import { indexerData } from "$lib/states.svelte";

    // Types
    import type { RAGPartition } from "$lib/types";

    // Properties
    let {
        selectedPartition = $bindable(),
        onSelect,
    }: {
        selectedPartition?: RAGPartition | null; // The input's selected partition
        onSelect?: (partition: RAGPartition) => void; // Event to fire when a partition is selected
    } = $props();

    // UI Properties
    let searchFilter: string = $state("");

    /**
     * Select a partition and fire onSelect when a partition is selected
     * @param partition the partition to select
     */
    function selectPartition(partition: RAGPartition) {
        selectedPartition = partition;
        if (onSelect) onSelect(partition);
    }

    /**
     * Locally creates a new partition, actualized on input
     * @param event the input
     */
    function updateNewPartition(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.value === "") {
            selectedPartition = indexerData.partitions[0];
        } else {
            selectedPartition = { partition: input.value, created_at: "-1", file_count: -1 };
        }
    }

    /**
     * Fire onSelect when the "Enter" key is pressed in the new partition input
     * @param event the KeyboardEvent
     */
    const selectNewPartition = (event: KeyboardEvent) => {
        if (event.key === "Enter" && onSelect && selectedPartition) onSelect(selectedPartition);
    };
</script>

<div
    class="absolute shadow-lg top-full left-0 z-50 mt-1 flex w-full overflow-hidden cursor-pointer flex-col items-start divide-y-1 divide-solid divide-slate-200 rounded-2xl border border-slate-200 bg-white pt-1"
>
    <input
        id="search-filter-input"
        class="w-full px-4 py-2 pt-1 text-sm text-slate-400 italic placeholder:text-slate-400 focus:outline-none"
        type="text"
        placeholder="Search partitions..."
        bind:value={searchFilter}
        aria-label="Search partitions"
    />

    {#if indexerData.partitions.filter((p) => p.partition.includes(searchFilter)).length === 0}
        <span class="w-full cursor-text px-4 py-2 text-start text-sm text-slate-400 italic">
            No matching partitions found. Check your spelling, or create a new one.
        </span>
    {/if}

    {#each indexerData.partitions.filter((p) => p.partition.includes(searchFilter)) as partition}
        <button
            class="w-full cursor-pointer px-4 py-2 text-left hover:bg-slate-50"
            onclick={() => selectPartition(partition)}
        >
            {partition.partition}
        </button>
    {/each}

    <div class="relative flex w-full items-center">
        <input
            id="new-partition-input"
            class="text w-full px-4 py-2 placeholder:text-linagora-500 hover:bg-slate-50 {selectedPartition?.file_count ===
            -1
                ? ''
                : 'cursor-pointer'} focus:cursor-text focus:outline-none focus:placeholder:text-slate-400"
            type="text"
            placeholder="+ Add a new partition"
            oninput={updateNewPartition}
            onkeydown={selectNewPartition}
            value={selectedPartition?.file_count === -1 ? selectedPartition.partition : ""}
            aria-label="Add new partition"
        />

        {#if selectedPartition?.file_count === -1}
            <button
                onclick={() => {
                    if (onSelect && selectedPartition) onSelect(selectedPartition);
                }}
                class="absolute right-2 cursor-pointer rounded-lg bg-linagora-500 px-2 py-1 text-xs font-semibold text-white hover:bg-linagora-600"
            >
                Create
            </button>
        {/if}
    </div>
</div>
