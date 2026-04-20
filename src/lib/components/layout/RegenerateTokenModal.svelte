<script lang="ts">
    /**
     * Modal that lets the authenticated user regenerate their own API token.
     *
     * The previous token is invalidated as soon as the new one is returned by
     * the backend, so we display the new token exactly once with a copy button
     * and a strong warning. In token mode we also update the browser-stored
     * auth token so the user is not locked out of the UI.
     */

    import { onMount } from "svelte";
    import * as api from "$lib/api";
    import { _ } from "svelte-i18n";
    import { authToken, authTokenCreatedAt } from "$lib/persisted.svelte";
    import { indexerData } from "$lib/states.svelte";

    // Icons
    import Close from "$lib/icons/Close.svelte";
    import Key from "$lib/icons/Key.svelte";
    import Copy from "$lib/icons/Copy.svelte";
    import PartialCircle from "$lib/icons/PartialCircle.svelte";

    let { onClose }: { onClose: () => void } = $props();

    type Step = "confirm" | "loading" | "success" | "error";
    let step: Step = $state("confirm");
    let newToken: string | null = $state(null);
    let errorMessage: string = $state("");
    let copied = $state(false);

    async function regenerate() {
        const user = indexerData.userInfo;
        if (!user) {
            errorMessage = $_('regenerate_token.user_info_not_loaded');
            step = "error";
            return;
        }

        step = "loading";
        try {
            const token = await api.regenerateUserToken(Number(user.id));
            newToken = token;

            // Token-mode sessions authenticate via the stored auth token; replace
            // it so the UI keeps working with the freshly generated value. In
            // oidc mode the UI session lives in a cookie, so we leave it alone.
            if (!api.isOidcMode() && authToken.current) {
                authToken.current = token;
                authTokenCreatedAt.current = Date.now();
            }

            step = "success";
        } catch (err) {
            console.error("Token regeneration failed:", err);
            errorMessage =
                err instanceof Error ? err.message : $_('regenerate_token.unknown_error');
            step = "error";
        }
    }

    async function copyToken() {
        if (!newToken) return;
        try {
            await navigator.clipboard.writeText(newToken);
            copied = true;
            setTimeout(() => (copied = false), 2000);
        } catch (err) {
            console.error("Clipboard write failed:", err);
        }
    }

    function handleKey(event: KeyboardEvent) {
        if (event.key === "Escape") onClose();
    }

    onMount(() => {
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
    class="fixed inset-0 z-100 h-screen w-screen bg-slate-500/20 backdrop-blur-xs"
    onclick={onClose}
    role="dialog"
    tabindex="-1"
    aria-labelledby="regenerate-token-title"
></div>

<div
    class="fixed top-1/2 left-1/2 z-100 -translate-x-1/2 -translate-y-1/2
    w-[32rem] max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden
    rounded-3xl bg-white shadow-lg"
>
    <div class="flex items-center justify-between p-6 pb-4">
        <h1
            id="regenerate-token-title"
            class="flex items-center gap-2 text-xl font-semibold"
        >
            <Key className="size-6 fill-linagora-500" />
            {$_('regenerate_token.title')}
        </h1>
        <button
            onclick={onClose}
            class="flex items-center justify-center"
            aria-label={$_('regenerate_token.close_aria')}
        >
            <Close
                className="size-6 stroke-3 rounded-full p-1 hover:bg-slate-100 cursor-pointer"
            />
        </button>
    </div>

    <div class="px-6 pb-6 flex flex-col space-y-4 overflow-y-auto">
        {#if step === "confirm"}
            <p class="text-slate-700">
                {@html $_('regenerate_token.confirm_description')}
            </p>
            <p class="text-sm text-slate-500">
                {$_('regenerate_token.once_warning')}
            </p>

            <div class="flex justify-end gap-3 pt-2">
                <button
                    class="cursor-pointer rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-500 hover:bg-slate-50"
                    onclick={onClose}
                >
                    {$_('common.cancel')}
                </button>
                <button
                    class="cursor-pointer rounded-2xl border-none bg-linagora-500 px-4 py-2 font-semibold text-white hover:bg-linagora-600"
                    onclick={regenerate}
                >
                    {$_('regenerate_token.regenerate')}
                </button>
            </div>
        {:else if step === "loading"}
            <div class="flex flex-col items-center justify-center py-8 gap-3">
                <PartialCircle
                    className="size-8 animate-spin fill-linagora-500"
                />
                <span class="text-slate-500">{$_('regenerate_token.generating')}</span>
            </div>
        {:else if step === "success" && newToken}
            <div
                class="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
                {$_('regenerate_token.copy_warning')}
            </div>

            <div class="flex flex-col gap-2">
                <label for="new-token" class="text-sm font-medium text-slate-600">
                    {$_('regenerate_token.new_token_label')}
                </label>
                <div class="flex items-stretch gap-2">
                    <input
                        id="new-token"
                        class="grow rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-sm text-slate-800"
                        readonly
                        value={newToken}
                        onclick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                        onclick={copyToken}
                        class="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                        title={$_('regenerate_token.copy_title')}
                    >
                        <Copy className="size-5 fill-slate-600" />
                        {copied ? $_('regenerate_token.copied') : $_('regenerate_token.copy')}
                    </button>
                </div>
            </div>

            <div class="flex justify-end pt-2">
                <button
                    class="cursor-pointer rounded-2xl border-none bg-linagora-500 px-4 py-2 font-semibold text-white hover:bg-linagora-600"
                    onclick={onClose}
                >
                    {$_('common.done')}
                </button>
            </div>
        {:else if step === "error"}
            <div
                class="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
                {errorMessage}
            </div>
            <div class="flex justify-end gap-3 pt-2">
                <button
                    class="cursor-pointer rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-500 hover:bg-slate-50"
                    onclick={onClose}
                >
                    {$_('common.close')}
                </button>
                <button
                    class="cursor-pointer rounded-2xl border-none bg-linagora-500 px-4 py-2 font-semibold text-white hover:bg-linagora-600"
                    onclick={() => (step = "confirm")}
                >
                    {$_('common.retry')}
                </button>
            </div>
        {/if}
    </div>
</div>
