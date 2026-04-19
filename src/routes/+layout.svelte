<script lang="ts">
    import { base } from "$app/paths";
    /**
     * This file serves as the main layout for the application.
     * It handles authentication, UI state, data loading, and rendering of child components.
     * @author Ulysse Bouchet for LINAGORA
     */

    // Styles
    import "../app.css";

    // Utilities
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import * as api from "$lib/api";

    // i18n
    import { isLoading as i18nLoading, _ } from "svelte-i18n";
    import { initI18n } from "$lib/i18n";

    // States, persisted states, and cookies
    import { ui } from "$lib/states.svelte";
    import { authToken, authTokenCreatedAt } from "$lib/persisted.svelte";

    // Components
    import Login from "$lib/components/layout/Login.svelte";
    import NavBar from "$lib/components/layout/NavBar.svelte";

    // Icons
    import PartialCircle from "$lib/icons/PartialCircle.svelte";

    // Properties
    let { data, children } = $props();

    // Initialize i18n with server-provided default language
    initI18n(data.defaultLanguage);

    // Reactive variables
    let loading = $state(true);

    // Run when the component initializes for the first time
    onMount(async () => {
        await api.loadConfig();

        if (api.isOidcMode()) {
            // oidc mode: no login screen, check auth via /users/info
            ui.showLoginPage = false; // never show the password form
            try {
                const ok = await api.login(); // checks /users/info with credentials: "include"
                if (!ok) {
                    const next = encodeURIComponent(window.location.href);
                    window.location.href = `${api.getApiBaseUrl()}/auth/login?next=${next}`;
                    return; // stop here, browser is navigating
                }
            } catch {
                const next = encodeURIComponent(window.location.href);
                window.location.href = `${api.getApiBaseUrl()}/auth/login?next=${next}`;
                return;
            }
            loading = false;
            return;
        }

        // token mode: UNCHANGED from current implementation
        if (!api.getIncludeCredentials()) {
            authToken.current = null;
            authTokenCreatedAt.current = null;
            ui.showLoginPage = false;
            loading = false;
            return;
        }

        // If the Auth Token is older than 24 hours, clear it
        if (
            authTokenCreatedAt.current &&
            Date.now() - authTokenCreatedAt.current > 24 * 60 * 60 * 1000
        ) {
            authToken.current = null;
            authTokenCreatedAt.current = null;
        }

        // Initial check to see if the user is already logged in
        if (authToken.current && (await api.login(authToken.current))) {
            ui.showLoginPage = false;
        } else if (
            page.route.id !== "/" &&
            page.route.id !== "/indexer" &&
            page.route.id !== "/dashboard"
        ) {
            goto(`${base}/`); // Redirect to home page to hide ids from URL
        }

        loading = false;
    });
</script>

{#if loading}
    <!-- Loading screen -->
    <div
        class="flex h-screen w-screen flex-col space-y-4 justify-center items-center"
    >
        <span> {$_('common.loading')} </span>
        <PartialCircle className="animate-spin fill-linagora-500 size-8" />
    </div>
{:else if ui.showLoginPage}
    <!-- Login screen -->
    <Login />
{:else}
    <!-- Main app screen -->
    <div class="flex h-screen">
        <NavBar />
        <main class="grow flex h-full flex-col">
            {@render children()}
        </main>
    </div>
{/if}
