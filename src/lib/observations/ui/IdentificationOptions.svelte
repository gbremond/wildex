<script lang="ts">
	import type { Component } from 'svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Item from '$lib/components/ui/item';
	import CameraIcon from '@lucide/svelte/icons/camera';
	import ImageIcon from '@lucide/svelte/icons/image';
	import MicIcon from '@lucide/svelte/icons/mic';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import {
		IDENTIFICATION_OPTIONS,
		type IdentificationOption,
		type IdentificationOptionId
	} from '../model/identification';
	import { IDENTIFICATION_COPY } from './identification-copy';
	import { m } from '$lib/paraglide/messages';

	let { onChoose }: { onChoose: (option: IdentificationOption) => void } = $props();

	const OPTION_ICONS: Record<IdentificationOptionId, Component> = {
		camera: CameraIcon,
		gallery: ImageIcon,
		sound: MicIcon,
		manual: PencilIcon
	};
</script>

<Drawer.Header>
	<Drawer.Title>{m.identification_title()}</Drawer.Title>
	<Drawer.Description>{m.identification_question()}</Drawer.Description>
</Drawer.Header>

<Item.Group class="gap-2 px-4 pb-6">
	{#each IDENTIFICATION_OPTIONS as option (option.id)}
		{@const Icon = OPTION_ICONS[option.id]}
		<Item.Root variant="outline">
			{#snippet child({ props })}
				<button {...props} type="button" onclick={() => onChoose(option)}>
					<Item.Media variant="icon">
						<Icon aria-hidden="true" focusable="false" class="size-5" />
					</Item.Media>
					<Item.Content>
						<Item.Title>{IDENTIFICATION_COPY[option.id].label()}</Item.Title>
						<Item.Description>{IDENTIFICATION_COPY[option.id].hint()}</Item.Description>
					</Item.Content>
					<Item.Actions>
						<ChevronRightIcon
							aria-hidden="true"
							focusable="false"
							class="size-4 text-muted-foreground"
						/>
					</Item.Actions>
				</button>
			{/snippet}
		</Item.Root>
	{/each}
</Item.Group>
