<script lang="ts">
	// Properties
	let { className = 'size-5 stroke-3' }: { className?: string } = $props();
</script>

<svg viewBox="0 0 24 24" fill="inherit" class={className} xmlns="http://www.w3.org/2000/svg">
	<path
		d="M3 10.5L5 8.8V5C5 4.44772 5.44772 4 6 4H8C8.55228 4 9 4.44772 9 5V5.5L12 3L21 10.5"
		stroke="inherit"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M5 11V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V11"
		stroke="inherit"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20"
		stroke="inherit"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
