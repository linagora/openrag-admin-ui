<script lang="ts">
    import { base } from "$app/paths";
    /**
     * This file corresponds to the header component of the application.
     * It displays the current partition and file, provides a button to upload files,
     * and allows the user to lock access by clearing the Auth Token.
     * @author Ulysse Bouchet for LINAGORA
     */

    import * as api from "$lib/api";
    import { _ } from "svelte-i18n";

    // States, persisted states, and cookies
    import { dashboardData } from "$lib/states.svelte";

    // Icons
    import Dashboard from "$lib/icons/Dashboard.svelte";
    import Refresh from "$lib/icons/Refresh.svelte";
    import { onMount } from "svelte";

    let refreshing = $state(false);
    let countdown = $state(5);
    let tickTimeout: ReturnType<typeof setTimeout> | undefined;

    async function refreshActors() {
        refreshing = true;
        try {
            dashboardData.actors = await api.fetchActors();
        } catch (err) {
            console.error("Auto-refresh fetchActors failed:", err);
        } finally {
            refreshing = false;
            countdown = 5;
        }
    }

    async function tick() {
        countdown -= 1;
        if (countdown == 0) await refreshActors();
        tickTimeout = setTimeout(tick, 1000);
    }

    onMount(() => {
        tickTimeout = setTimeout(tick, 1000);
        return () => clearTimeout(tickTimeout);
    });
</script>

<header class="flex items-center justify-between p-4 pb-0">
    <!-- Navigation between files and partitions -->
    <div class="flex items-center space-x-2 text-xl font-bold">
        <a href="{base}/dashboard" class="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-100">
            <Dashboard className="size-6 fill-linagora-500" /> {$_('nav.dashboard')}
        </a>
    </div>

    <!-- Action buttons -->
    <div class="flex items-center space-x-6">
        {#if countdown > 0}
            <span class="">{$_('dashboard.auto_refresh_in', { values: { countdown } })}</span>
        {:else}
            <span class="">{$_('dashboard.auto_refreshing')}</span>
        {/if}
        <!-- Upload files -->
        <button
            onclick={refreshActors}
            class="flex items-center gap-2 rounded-2xl border-none bg-linagora-500 px-4 py-2 font-semibold text-white hover:bg-linagora-600
            {refreshing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer '}"
        >
            <Refresh className="size-5 fill-white {refreshing ? 'animate-spin' : ''}" /> {$_('dashboard.refresh_list')}
        </button>
    </div>
</header>
