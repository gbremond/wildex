<script lang="ts">
	import Feather from '@lucide/svelte/icons/feather';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { speciesAvatarGradient } from './species-avatar';

	let { seed }: { seed: string } = $props();
</script>

<Avatar size="lg">
	<AvatarFallback style="background-image: {speciesAvatarGradient(seed)}" class="text-white/90 ">
		<Feather class="size-4" />
	</AvatarFallback>
</Avatar>
