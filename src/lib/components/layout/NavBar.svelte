<script lang="ts">
    // Utilities
    import { page } from "$app/state";
    import * as api from "$lib/api";

    // Persisted states
    import { navbarCollapsed } from "$lib/persisted.svelte";
    import { authToken, authTokenCreatedAt } from "$lib/persisted.svelte";

    // Icons
    import ChevronDown from "$lib/icons/ChevronDown.svelte";
    import Dashboard from "$lib/icons/Dashboard.svelte";
    import FileStorage from "$lib/icons/FileStorage.svelte";
    import Home from "$lib/icons/Home.svelte";
    import OpenRAG from "$lib/icons/OpenRAG.svelte";
    import Lock from "$lib/icons/Lock.svelte";

    let currentRoute: string = $state("");

    function toggleCollapse() {
        navbarCollapsed.current = !navbarCollapsed.current;
    }

    $effect(() => {
        handleRouting();
    });

    /**
     * This function handles data loading for different routes of the application
     */
    async function handleRouting() {
        console.log("Route changed:", page.route.id);
        if (page.route.id === "/" || page.route.id === "/(home)") {
            currentRoute = "home";
        } else if (page.route.id?.includes("/indexer")) {
            currentRoute = "indexer";
        } else if (page.route.id?.includes("/dashboard")) {
            currentRoute = "dashboard";
        }
    }
</script>

{#if navbarCollapsed.current}
    <!-- Collapsed navbar -->
    <div class="relative min-w-16 h-full bg-linagora-500 rounded-r-2xl flex flex-col items-center pt-4 pb-6">
        <a href="/">
            <OpenRAG
                className="group size-12 rounded-2xl cursor-pointer hover:bg-linagora-600"
                circleClassName="group-hover:fill-linagora-600"
            />
        </a>

        <div class="h-px w-8 mt-4 mb-3 bg-linagora-600"></div>

        <div class="flex flex-col space-y-1 text-white font-medium items-center">
            <!-- Home -->
            <a
                href="/"
                title="Home"
                class="p-2 rounded-2xl
                {currentRoute === 'home' ? 'bg-linagora-700' : 'bg-linagora-500 hover:bg-linagora-600'}"
            >
                <Home className="size-6 stroke-white fill-transparent" />
            </a>
            <!-- Indexer -->
            <a
                href="/indexer/"
                title="Indexer"
                class="p-2 rounded-2xl
                {currentRoute === 'indexer' ? 'bg-linagora-700' : 'bg-linagora-500 hover:bg-linagora-600'}"
            >
                <FileStorage className="size-6 fill-white" />
            </a>
            <!-- Dashboard -->
            <a
                href="/dashboard/"
                title="Dashboard"
                class="p-2 rounded-2xl
                {currentRoute === 'dashboard' ? 'bg-linagora-700' : 'bg-linagora-500 hover:bg-linagora-600'}"
            >
                <Dashboard className="size-6 fill-white" />
            </a>
        </div>

        {#if api.INCLUDE_CREDENTIALS}
            <div class="h-px w-8 mt-4 mb-3 bg-linagora-600"></div>

            <!-- Lock access to the indexer -->
            <button
                title="Lock access"
                class="cursor-pointer group rounded-2xl p-2 font-medium text-linagora-900
            hover:bg-linagora-600 hover:text-linagora-950"
                onclick={() => {
                    authTokenCreatedAt.current = null; // Clear the Auth Token creation time
                    authToken.current = null; // Clear the Auth Token
                    window.location.reload(); // Reload the page to reset the states
                }}
            >
                <Lock className="size-6 fill-linagora-900 group-hover:fill-linagora-950" />
            </button>
        {/if}

        <div class="grow"></div>

        <div class="flex flex-col items-center">
            <span class="text-xs text-linagora-200"> LOGO </span>
        </div>

        <button
            onclick={toggleCollapse}
            class="absolute left-full -translate-x-2.5 translate-y-1/2 top-1/2 size-5 flex justify-center items-center
            bg-white border border-linagora-500 rounded-full text-xs cursor-pointer
            hover:bg-slate-100"
        >
            <ChevronDown className="-rotate-90 stroke-black stroke-3 size-3" />
        </button>
    </div>
{:else}
    <!-- Opened navbar -->
    <div class="relative min-w-64 h-full bg-linagora-500 rounded-r-2xl flex flex-col p-6">
        <a href="/">
            <div
                class="group w-full pr-4 py-1 text-2xl text-white font-bold self-center mb-2 flex items-center space-x-1.5 rounded-3xl cursor-pointer
            hover:bg-linagora-600"
            >
                <OpenRAG className="group size-16 cursor-pointer" circleClassName="group-hover:fill-linagora-600" />
                <span> OpenRAG </span>
            </div>
        </a>

        <div class="h-px mt-4 mb-3 bg-linagora-600"></div>

        <div class="flex flex-col space-y-1 text-white font-medium">
            <!-- Home -->
            <a
                href="/"
                class="relative p-2 flex items-center space-x-2 rounded-2xl
                {currentRoute === 'home' ? 'bg-linagora-700' : 'bg-linagora-500 hover:bg-linagora-600'}"
            >
                <Home className="size-6 stroke-white fill-transparent" /> <span> Home </span>
                {#if currentRoute === "home"}
                    <div class="absolute right-3 size-1 rounded-full bg-white"></div>
                {/if}
            </a>
            <!-- Indexer -->
            <a
                href="/indexer"
                class="relative p-2 flex items-center space-x-2 rounded-2xl
                {currentRoute === 'indexer' ? 'bg-linagora-700' : 'bg-linagora-500 hover:bg-linagora-600'}"
            >
                <FileStorage className="size-6 fill-white" /> <span> Indexer </span>
                {#if currentRoute === "indexer"}
                    <div class="absolute right-3 size-1 rounded-full bg-white"></div>
                {/if}
            </a>
            <!-- Dashboard -->
            <a
                href="/dashboard"
                class="relative p-2 flex items-center space-x-2 rounded-2xl
                {currentRoute === 'dashboard' ? 'bg-linagora-700' : 'bg-linagora-500 hover:bg-linagora-600'}"
            >
                <Dashboard className="size-6 fill-white" /> <span> Dashboard </span>
                {#if currentRoute === "dashboard"}
                    <div class="absolute right-3 size-1 rounded-full bg-white"></div>
                {/if}
            </a>
        </div>

        {#if api.INCLUDE_CREDENTIALS}
            <div class="h-px mt-4 mb-3 bg-linagora-600"></div>

            <!-- Lock access to the indexer -->
            <button
                class="cursor-pointer group flex items-center gap-2 rounded-2xl p-2 font-medium text-linagora-900
            hover:bg-linagora-600 hover:text-linagora-950"
                onclick={() => {
                    authTokenCreatedAt.current = null; // Clear the Auth Token creation time
                    authToken.current = null; // Clear the Auth Token
                    window.location.reload(); // Reload the page to reset the states
                }}
            >
                <Lock className="size-6 fill-linagora-900 group-hover:fill-linagora-950" />
                Lock access
            </button>
        {/if}
        
        <div class="grow"></div>

        <div class="flex flex-col items-center">
            <span class="text-xs text-linagora-200"> LINAGORA - 2025</span>
        </div>

        <button
            onclick={toggleCollapse}
            class="absolute left-full -translate-x-2.5 translate-y-1/2 top-1/2 size-5 flex justify-center items-center
            bg-white border border-linagora-500 rounded-full text-xs cursor-pointer
            hover:bg-slate-100"
        >
            <ChevronDown className="rotate-90 stroke-black stroke-3 size-3" />
        </button>
    </div>
{/if}
