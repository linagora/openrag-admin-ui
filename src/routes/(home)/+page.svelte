<script lang="ts">
    import { base } from "$app/paths";
    // Icons
    import OpenRAG from "$lib/icons/OpenRAG.svelte";
    import FileStorage from "$lib/icons/FileStorage.svelte";
    import Dashboard from "$lib/icons/Dashboard.svelte";
    import { _ } from "svelte-i18n";
    // State
    import { indexerData } from "$lib/states.svelte";
</script>

<div class="grow px-12 pt-5 pb-8 h-full flex flex-col overflow-y-scroll">
    <h1 class="my-4 text-3xl font-bold flex items-center">
        {$_('home.welcome_prefix')} &nbsp;
        <div class="pl-2 pr-4 py-1 flex items-center space-x-1 rounded-2xl text-2xl text-white bg-linagora-500">
            <OpenRAG className="size-10" circleClassName="fill-transparent" /> <span>OpenRAG</span>
        </div>
        &nbsp; {$_('home.welcome_suffix')}
    </h1>
    <h3 class="mb-12">
        {$_('home.subtitle')}
    </h3>
    <h2 class="mb-6 text-2xl font-semibold">{$_('home.whats_openrag')}</h2>
    <div class="mb-12 flex flex-col space-y-2">
        <p>
            {$_('home.openrag_description')}
        </p>
        <p class="text-slate-500 italic"> {$_('home.openrag_built_by')} </p>
    </div>

    <h2 class="mb-6 text-2xl font-semibold">{$_('home.start_working')} <span class="italic text-linagora-500"> {$_('home.now')}</span></h2>
    <div class="flex space-x-6">
        <!-- Indexer -->
        <a
            href="{base}/indexer"
            aria-label={$_('home.indexer_link_aria')}
            class="h-72 w-60 p-6 flex flex-col items-center
            rounded-3xl border border-slate-200 shadow-lg cursor-pointer
            hover:shadow-xl hover:bg-slate-50"
        >
            <FileStorage className="size-16 fill-linagora-500 mb-4" />
            <span class="text-center font-medium"> {$_('home.indexer_card_description')} </span>
            <div class="grow"></div>
            <span class="bg-linagora-500 px-4 py-2 rounded-2xl text-white font-medium hover:bg-linagora-600">
                {$_('home.go_to_indexer')}
            </span>
        </a>
        {#if indexerData.userInfo?.is_admin}
            <!-- Dashboard (admin only) -->
            <a
                href="{base}/dashboard"
                aria-label={$_('home.dashboard_link_aria')}
                class="h-72 w-60 p-6 flex flex-col items-center
                rounded-3xl border border-slate-200 shadow-lg cursor-pointer
                hover:shadow-xl hover:bg-slate-50"
            >
                <Dashboard className="size-16 fill-linagora-500 mb-4" />
                <span class="text-center font-medium"> {$_('home.dashboard_card_description')} </span>
                <div class="grow"></div>
                <span class="bg-linagora-500 px-4 py-2 rounded-2xl text-white font-medium hover:bg-linagora-600">
                    {$_('home.go_to_dashboard')}
                </span>
            </a>
        {/if}
    </div>
</div>
