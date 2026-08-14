<script lang="ts">
	// Purely decorative: it says "we are listening", not what was heard. The
	// animation is CSS so it keeps running on the compositor while inference
	// blocks the main thread every window.
	const BARS = [0.9, 0.5, 1, 0.65, 0.85, 0.4, 0.75];
</script>

<div class="flex items-end gap-1" role="status" aria-label="Listening">
	{#each BARS as height, index (index)}
		<span
			class="wave-bar w-1 rounded-full bg-current"
			style="--peak: {height}; --delay: {index * 0.11}s"
		></span>
	{/each}
</div>

<style>
	.wave-bar {
		height: 1.25rem;
		transform-origin: bottom;
		animation: pulse 0.9s ease-in-out infinite alternate;
		animation-delay: var(--delay);
	}

	@keyframes pulse {
		from {
			transform: scaleY(0.18);
		}
		to {
			transform: scaleY(var(--peak));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wave-bar {
			animation: none;
			transform: scaleY(var(--peak));
		}
	}
</style>
