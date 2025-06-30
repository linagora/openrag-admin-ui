<script lang="ts">
	// Properties
	let { selectedOption = $bindable() }: { selectedOption: 'random' | 'filename' } = $props();
</script>

<div class="flex items-center">
	<button
		class="w-1/2 cursor-pointer rounded-l-md border border-r-0 py-2
        {selectedOption === 'random'
			? 'border-linagora-500 bg-linagora-500 font-semibold text-white'
			: 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:transition-colors'}"
		title="Generate a random UUID for each file"
		onclick={() => (selectedOption = 'random')}
	>
		Generate UUIDs
	</button>
	<button
		class="w-1/2 cursor-pointer rounded-r-md border border-l-0 py-2
        {selectedOption === 'filename'
			? 'border-linagora-500 bg-linagora-500 font-semibold text-white'
			: 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:transition-colors'}"
		title="Use the file names as file IDs"
		onclick={() => (selectedOption = 'filename')}
	>
		Use file names
	</button>
</div>
