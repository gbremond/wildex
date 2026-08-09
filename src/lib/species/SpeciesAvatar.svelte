<script lang="ts">
	import Feather from '@lucide/svelte/icons/feather';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { speciesAvatarGradient } from './species-avatar';

	let { seed, scientificName }: { seed: string; scientificName: string } = $props();

	let imageUrl = $derived(
		`https://birdnet.cornell.edu/taxonomy/api/image/${encodeURIComponent(scientificName)}?size=thumb`
	);
</script>

<Avatar size="lg" class="rounded-lg after:rounded-lg">
	<AvatarImage src={imageUrl} alt={scientificName} class="rounded-lg" />
	<AvatarFallback
		style="background-image: {speciesAvatarGradient(seed)}"
		class="rounded-lg text-white/90 "
	>
		<Feather class="size-4" />
	</AvatarFallback>
</Avatar>
