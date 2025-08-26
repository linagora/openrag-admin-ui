<script lang="ts">
    // Utilities
    import * as api from "$lib/api";

    // States
    import { dashboardData } from "$lib/states.svelte";

    // Icons
    import Refresh from "$lib/icons/Refresh.svelte";

    // Types
    import type { Actor } from "$lib/types";
    import HelpCircle from "$lib/icons/HelpCircle.svelte";

    const stateColors = {
        ALIVE: "text-green-500",
        DEAD: "text-red-500",
        PENDING_CREATION: "text-yellow-500",
    };

    const restartableClasses = [
        "TaskStateManager",
        "MarkerPool",
        "SerializerQueue",
        "Indexer",
        "MilvusDB",
        "llmSemaphore",
        "vlmSemaphore",
    ];

    let restartingActors = $state<string[]>([]);

    async function restartActor(actor: Actor) {
        restartingActors = [...restartingActors, actor.name];

        await api.restartActor(actor.name);
        dashboardData.actors = await api.fetchActors();

        restartingActors = restartingActors.filter((name) => name !== actor.name);
    }
</script>

<table class="min-w-full table-fixed text-sm">
    <thead>
        <tr class="sticky top-0 bg-white text-slate-600 shadow-[0_1px_0_0_theme(colors.slate.200)] z-10">
            <th class="w-76">Actor ID</th>
            <th class="w-84">Namespace</th>
            <th class="w-40">Class</th>
            <th>Name</th>
            <th
                class={dashboardData.actors.some((actor) => actor.state === "PENDING_CREATION")
                    ? "w-44"
                    : "w-24 !text-center"}
            >
                State
            </th>
            <th class="w-28">
                <div class="flex items-center justify-center space-x-1.5">
                    <span> Restart </span>
                    <button
                        class="cursor-pointer"
                        onclick={() => {
                            alert(
                                "Restarting an actor will create a new instance, and the old one will be killed. This means that multiple instances will appear in the list."
                            );
                        }}
                    >
                        <HelpCircle className="size-4 fill-slate-500 translate-y-0.25 hover:fill-slate-600" />
                    </button>
                </div>
            </th>
        </tr>
    </thead>
    <tbody class="divide-y divide-slate-200 border-b border-slate-200">
        {#each dashboardData.actors as actor}
            <tr class="text-slate-700">
                <td class="font-mono">{actor.actor_id}</td>
                <td class=""> {actor.namespace} </td>
                <td>
                    {actor.class_name}
                </td>
                <td class="">{actor.name !== "" ? actor.name : "-"}</td>
                <td
                    class="font-medium {stateColors[actor.state]} 
                    {dashboardData.actors.some((actor) => actor.state === 'PENDING_CREATION') ? '' : 'text-center'}"
                >
                    {actor.state}
                </td>
                <td class="flex items-center justify-center">
                    <button
                        title={!restartableClasses.includes(actor.class_name)
                            ? "This actor cannot be restarted"
                            : "Restart this actor"}
                        class="rounded-lg
                        {!restartableClasses.includes(actor.class_name)
                            ? ' cursor-not-allowed fill-slate-200'
                            : restartingActors.includes(actor.name)
                              ? ' animate-spin cursor-not-allowed fill-slate-400'
                              : ' cursor-pointer fill-slate-400 hover:fill-slate-700 hover:bg-slate-100'}
                            "
                        disabled={!restartableClasses.includes(actor.class_name) ||
                            restartingActors.includes(actor.name)}
                        onclick={() => restartActor(actor)}
                    >
                        <Refresh className="p-0.25 size-6" />
                    </button>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    th {
        text-align: start;
    }

    th,
    td {
        padding: 0.75rem 1rem;
        box-shadow: -1px 0 0 0 #e2e8f0; /* Tailwind slate-200 */
    }
</style>
