<script lang="ts">
    // Import states
    import {  tasks } from "$lib/states.svelte";

    // Import components
    import ChevronDown from "$lib/icons/ChevronDown.svelte";

    // Import icons
    import Folder from "$lib/icons/Folder.svelte";
    import type { RAGTaskStatus } from "$lib/types";
    import { getStyleFromTaskState } from "$lib/utils";

    // Import types

    // Properties
    let {
        category,
        opened = false,
    }: {
        category: RAGTaskStatus;
        opened?: boolean; // Optional, defaults to false
    } = $props();

    const toggleDropdown = () => {
        opened = !opened;
    };
</script>

<div class={opened ? "h-full overflow-y-auto" : ""}>
    <button
        onclick={toggleDropdown}
        class="sticky top-0 z-10 flex w-full cursor-pointer items-center justify-center space-x-1 border-t border-slate-200 bg-slate-100 py-2 hover:bg-slate-200
		{opened ? ' border-b shadow' : ''}"
    >
        <span class="text-xs font-semibold text-slate-500">
            {category} ({tasks.tasks.filter((task) => task.state === category).length})
        </span>
        <ChevronDown
            className="absolute right-3 size-3 stroke-slate-500 stroke-3
			{opened ? '' : '-rotate-90'}"
        />
    </button>
    {#if opened}
        <div class="divide-y divide-slate-200 h-full">
            <!-- Completed tasks should be links to the file page -->
            {#if category === "COMPLETED"}
                {#each tasks.tasks.filter((task) => task.state === category) as task}
                    <a
                        href={`/partition/${task.details.partition}/file/${task.details.file_id}`}
                        class="flex flex-col space-y-1 space-x-2 overflow-x-hidden px-4 py-3 break-all hover:bg-slate-100"
                    >
                        <div class="flex items-center space-x-1">
                            <Folder className="size-4 fill-linagora-500" />
                            <span class="text-xs text-slate-500">{task.details.partition}</span>
                        </div>
                        <span class="text-sm">{task.details.file_id}</span>
                        <span class="self-end text-xs font-bold {getStyleFromTaskState(task.state)}">
                            {task.state}
                        </span>
                    </a>
                {/each}
            {:else}
                {#each tasks.tasks.filter((task) => task.state === category) as task}
                    <div class="flex flex-col space-y-1 space-x-2 overflow-x-hidden px-4 py-3 break-all">
                        <div class="flex items-center space-x-1">
                            <Folder className="size-4 fill-linagora-500" />
                            <span class="text-xs text-slate-500">{task.details.partition}</span>
                        </div>
                        <span class="text-sm">{task.details.file_id}</span>
                        <span class="self-end text-xs font-bold {getStyleFromTaskState(task.state)}">
                            {task.state}
                        </span>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>
