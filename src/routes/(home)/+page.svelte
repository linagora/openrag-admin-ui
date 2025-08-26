<script lang="ts">
    // Icons
    import OpenRAG from "$lib/icons/OpenRAG.svelte";
    import FileStorage from "$lib/icons/FileStorage.svelte";
    import Dashboard from "$lib/icons/Dashboard.svelte";
</script>

<div class="grow px-12 pt-5 pb-8 h-full flex flex-col overflow-y-scroll">
    <h1 class="my-4 text-3xl font-bold flex items-center">
        Welcome to the &nbsp;
        <div class="pl-2 pr-4 py-1 flex items-center space-x-1 rounded-2xl text-2xl text-white bg-linagora-500">
            <OpenRAG className="size-10" circleClassName="fill-transparent" /> <span>OpenRAG</span>
        </div>
        &nbsp; admin interface !
    </h1>
    <h3 class="mb-12">
        Here, you can manage your OpenRAG deployment using various features, such as indexing files or inspecting Ray
        actors.
    </h3>
    <h2 class="mb-6 text-2xl font-semibold">What's OpenRAG ?</h2>
    <div class="mb-12 flex flex-col space-y-2">
        <p>
            OpenRAG is a lightweight, modular and extensible Retrieval-Augmented Generation (RAG) framework designed to
            explore and test advanced RAG techniques — 100% open source and focused on experimentation, not lock-in.
        </p>
        <p class="text-slate-500 italic"> Built by LINAGORA, OpenRAG offers a sovereign-by-design alternative to mainstream RAG stacks. </p>
    </div>

    <h2 class="mb-6 text-2xl font-semibold">Start working — <span class="italic text-linagora-500"> now !</span></h2>
    <div class="flex space-x-6">
        <!-- Indexer -->
        <a
            href="/indexer"
            aria-label="Link to indexer"
            class="h-72 w-60 p-6 flex flex-col items-center
            rounded-3xl border border-slate-200 shadow-lg cursor-pointer
            hover:shadow-xl hover:bg-slate-50"
        >
            <FileStorage className="size-16 fill-linagora-500 mb-4" />
            <span class="text-center font-medium"> Upload, delete or explore files and partitions </span>
            <div class="grow"></div>
            <span class="bg-linagora-500 px-4 py-2 rounded-2xl text-white font-medium hover:bg-linagora-600">
                Go to indexer
            </span>
        </a>
        <!-- Dashboard -->
        <a
            href="/dashboard"
            aria-label="Link to dashboard"
            class="h-72 w-60 p-6 flex flex-col items-center
            rounded-3xl border border-slate-200 shadow-lg cursor-pointer
            hover:shadow-xl hover:bg-slate-50"
        >
            <Dashboard className="size-16 fill-linagora-500 mb-4" />
            <span class="text-center font-medium"> Inspect and restart all the Ray actors </span>
            <div class="grow"></div>
            <span class="bg-linagora-500 px-4 py-2 rounded-2xl text-white font-medium hover:bg-linagora-600">
                Go to dashboard
            </span>
        </a>
    </div>
</div>
