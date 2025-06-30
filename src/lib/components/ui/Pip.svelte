<script lang="ts">
	// Properties
	let {
		text,
		color = 'linagora'
	}: {
		text: string; // Text of the pip
		color?: 'linagora' | 'red' | 'blue' | 'green'; // Color of the pip (limited selections)
	} = $props();

	// Available colors (force tailwind parsing)
	const colors = {
		linagora: 'bg-linagora-500',
		red: 'bg-red-500',
		blue: 'bg-blue-500',
		green: 'bg-green-500'
	};
</script>

<span class="rounded-full {colors[color]} px-1 py-0.5 text-[0.5rem] font-bold text-white uppercase">
	{text}
</span>
