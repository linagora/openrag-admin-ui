<script lang="ts">
    // Import states
    import { ui } from "$lib/states.svelte";
    import { authToken, authTokenCreatedAt } from "$lib/persisted.svelte";

    // Import icons
    import Lock from "$lib/icons/Lock.svelte";
    import PartialCircle from "$lib/icons/PartialCircle.svelte";
    import * as api from "$lib/api";
    import EyeClosed from "$lib/icons/EyeClosed.svelte";
    import EyeOpened from "$lib/icons/EyeOpened.svelte";

    let authTokenInput: HTMLInputElement;
    let showSubmitButton = $state(false);
    let showPassword = $state(false);
    let loading = $state(false);
    let focused = $state(false);

    function animateError() {
        authTokenInput.style.translate = "-5px";
        authTokenInput.classList.add("border-red-500", "bg-red-50", "placeholder:text-red-500");
        authTokenInput.classList.remove(
            "border-slate-200",
            "hover:border-slate-300",
            "focus:border-slate-400",
            "hover:bg-slate-50",
            "focus:bg-slate-100",
            "focus:placeholder:text-slate-400"
        );
        setTimeout(() => {
            authTokenInput.style.translate = "5px";
            setTimeout(() => {
                authTokenInput.style.translate = "0px";
                authTokenInput.classList.remove("border-red-500", "bg-red-50", "placeholder:text-red-500");
                authTokenInput.classList.add(
                    "border-slate-200",
                    "hover:border-slate-300",
                    "focus:border-slate-400",
                    "hover:bg-slate-50",
                    "focus:bg-slate-100",
                    "focus:placeholder:text-slate-400"
                );
            }, 100);
        }, 100);
    }

    function handleInput(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.value !== "") {
            showSubmitButton = true;
        } else {
            showSubmitButton = false;
            authTokenInput.placeholder = "Enter your Auth Token";
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        authTokenInput.type = "password"; // Reset to password type on key down
        if (event.key === "Enter") {
            handleSubmit();
        }
    }

    async function handleSubmit() {
        loading = true;
        showSubmitButton = false;

        // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading delay

        try {
            if (await api.login(authTokenInput.value)) {
                // If the Auth Token is correct, store it in a cookie, hide the login page and access the app
                authToken.current = authTokenInput.value; // Save the Auth Token in a cookie
                authTokenCreatedAt.current = Date.now(); // Save the creation time of the Auth Token
                loading = false;
                ui.showLoginPage = false;
            } else throw "Login failed.";
        } catch (err) {
            // Clear the input and hide the submit button
            authTokenInput.value = "";
            loading = false;

            // Animate the input to indicate an error
            authTokenInput.placeholder = "Incorrect Auth Token";
            animateError();
        }
    }

    function togglePasswordVisibility() {
        if (authTokenInput.type === "password") {
            showPassword = true;
            authTokenInput.type = "text";
        } else {
            showPassword = false;
            authTokenInput.type = "password";
        }
        authTokenInput.focus();
    }
</script>

<div class="flex flex-col items-center justify-end relative h-[50vh] w-screen">
    <Lock className="size-36 fill-linagora-500 mb-4" />
    <span class="font-bold text-2xl mb-6">Access protected</span>
    <div class="relative flex items-center">
        <input
            bind:this={authTokenInput}
            bind:focused
            type="password"
            placeholder="Enter your Auth Token"
            class="w-64 cursor-pointer rounded-2xl border border-slate-200 pl-4 py-2 placeholder:text-center
                 hover:border-slate-300 hover:bg-slate-50
                focus:cursor-text focus:border-slate-400 focus:bg-slate-100 focus:outline-none focus:placeholder:text-slate-400
                {showSubmitButton ? 'pr-12' : 'pr-4 focus:text-center '}"
            oninput={handleInput}
            onkeydown={handleKeyDown}
        />
        {#if showSubmitButton}
            <button
                onclick={togglePasswordVisibility}
                class="absolute h-full right-0 rounded-r-2xl p-2 cursor-pointer border hover:bg-slate-200
                {focused ? 'border-slate-400 border-l-slate-300' : 'border-slate-200 border-l-slate-200'}"
            >
                {#if showPassword}
                    <EyeClosed className="size-5 stroke-2 text-slate-400" />
                {:else}
                    <EyeOpened className="size-5 stroke-2 text-slate-400" />
                {/if}
            </button>
        {/if}
    </div>
    {#if showSubmitButton}
        <button
            class="absolute top-full mt-2 cursor-pointer flex items-center justify-center w-64 font-semibold rounded-2xl bg-linagora-500 px-4 py-2 text-white hover:bg-linagora-600"
            onclick={handleSubmit}
        >
            <span> Unlock </span>
        </button>
    {:else if loading}
        <PartialCircle className="absolute top-full mt-4 size-6 fill-linagora-500 animate-spin" />
    {/if}
</div>
