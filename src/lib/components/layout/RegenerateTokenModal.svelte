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
            errorMessage = "User information is not loaded yet.";
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
                err instanceof Error ? err.message : "Unknown error while regenerating the token.";
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
            Regenerate API token
        </h1>
        <button
            onclick={onClose}
            class="flex items-center justify-center"
            aria-label="Close regenerate token modal"
        >
            <Close
                className="size-6 stroke-3 rounded-full p-1 hover:bg-slate-100 cursor-pointer"
            />
        </button>
    </div>

    <div class="px-6 pb-6 flex flex-col space-y-4 overflow-y-auto">
        {#if step === "confirm"}
            <p class="text-slate-700">
                A new API token will be generated for your account. The
                <strong>current token will stop working immediately</strong>,
                and every integration that relies on it will need to be
                updated.
            </p>
            <p class="text-sm text-slate-500">
                The new token is shown exactly once — it is stored only as a
                hash in the database, so make sure to save it before closing
                this dialog.
            </p>

            <div class="flex justify-end gap-3 pt-2">
                <button
                    class="cursor-pointer rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-500 hover:bg-slate-50"
                    onclick={onClose}
                >
                    Cancel
                </button>
                <button
                    class="cursor-pointer rounded-2xl border-none bg-linagora-500 px-4 py-2 font-semibold text-white hover:bg-linagora-600"
                    onclick={regenerate}
                >
                    Regenerate token
                </button>
            </div>
        {:else if step === "loading"}
            <div class="flex flex-col items-center justify-center py-8 gap-3">
                <PartialCircle
                    className="size-8 animate-spin fill-linagora-500"
                />
                <span class="text-slate-500">Generating new token...</span>
            </div>
        {:else if step === "success" && newToken}
            <div
                class="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
                Copy this token and store it safely — it will not be shown
                again.
            </div>

            <div class="flex flex-col gap-2">
                <label for="new-token" class="text-sm font-medium text-slate-600">
                    Your new API token
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
                        title="Copy token to clipboard"
                    >
                        <Copy className="size-5 fill-slate-600" />
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>

            <div class="flex justify-end pt-2">
                <button
                    class="cursor-pointer rounded-2xl border-none bg-linagora-500 px-4 py-2 font-semibold text-white hover:bg-linagora-600"
                    onclick={onClose}
                >
                    Done
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
                    Close
                </button>
                <button
                    class="cursor-pointer rounded-2xl border-none bg-linagora-500 px-4 py-2 font-semibold text-white hover:bg-linagora-600"
                    onclick={() => (step = "confirm")}
                >
                    Retry
                </button>
            </div>
        {/if}
    </div>
</div>
