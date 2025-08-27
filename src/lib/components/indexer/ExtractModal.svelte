<script lang="ts">
    // States
    import { indexerData } from "$lib/states.svelte";

    // Icons
    import Collapse from "$lib/icons/Collapse.svelte";

    let {
        showExtractModal = $bindable(),
        selectedExtract,
    }: {
        showExtractModal: boolean;
        selectedExtract: string | null;
    } = $props();

    async function closeExtractModal() {
        showExtractModal = false;
    }
</script>

<button
    class="absolute top-0 left-0 z-100 h-screen w-screen bg-slate-500/20 backdrop-blur-xs"
    onclick={closeExtractModal}
    role="dialog"
    tabindex="-1"
    aria-labelledby="upload-modal-title"
></button>

<div
    class="absolute top-0 left-0 z-100 m-4 h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] flex flex-col items-center overflow-hidden rounded-3xl bg-white shadow-lg"
>
    <div class="sticky top-0 flex items-center justify-between w-full p-6 bg-white shadow">
        <span>Extract #{selectedExtract} from {indexerData.currentFile?.metadata.filename} </span>
        <button onclick={closeExtractModal} class="cursor-pointer">
            <Collapse className="size-7 p-1 rounded-full hover:bg-slate-100" />
        </button>
    </div>

    <div
        class="prose prose-pre:max-w-full w-full max-w-full p-6 text-sm overflow-y-auto wrap-anywhere"
        id="extract-full"
    ></div>
</div>
