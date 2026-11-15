<script lang="ts" module>
	/** `delete` opens straight on the delete question, as the list's trash button does. */
	export type DetailsMode = 'details' | 'delete';

	export type OpenedObservation = { observation: Observation; mode: DetailsMode };
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import BottomSheetContent from '$lib/components/BottomSheetContent.svelte';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { journal } from '../data/journal.svelte';
	import { observedName, type Observation } from '../model/observation';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import ObservationPhoto from './ObservationPhoto.svelte';

	let { opened = $bindable(null) }: { opened: OpenedObservation | null } = $props();

	let confirming = $derived(opened?.mode === 'delete');

	const observedAtFormat = new Intl.DateTimeFormat(getLocale(), {
		dateStyle: 'full',
		timeStyle: 'short'
	});

	function close() {
		opened = null;
	}

	// From the trash button Keep cancels, from the details it goes back to them.
	function keep() {
		if (opened?.mode === 'delete') close();
		else confirming = false;
	}

	async function remove(observation: Observation) {
		await journal.remove(observation);
		close();
	}
</script>

<!-- Bound, not just passed: after a swipe down the drawer kept its own closed state, and
     the next observation tapped opened nothing. -->
<Drawer.Root bind:open={() => opened !== null, (isOpen) => !isOpen && close()}>
	<BottomSheetContent>
		{#if opened}
			{@const { observation } = opened}
			{@const tripName = journal.tripName(observation.tripId)}
			<Drawer.Header class="group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
				<Drawer.Title>{observedName(observation.species, getLocale())}</Drawer.Title>
				<Drawer.Description>
					{observedAtFormat.format(new Date(observation.observedAt))}
					{#if tripName}· {tripName}{/if}
				</Drawer.Description>
			</Drawer.Header>

			<div class="flex flex-col gap-4 px-4 pb-6">
				{#if confirming}
					<p class="text-sm">{m.observation_details_delete_confirm()}</p>
					<div class="grid grid-cols-2 gap-2">
						<Button variant="outline" size="lg" onclick={keep}>
							{m.observation_details_keep()}
						</Button>
						<Button variant="destructive" size="lg" onclick={() => remove(observation)}>
							{m.observation_details_delete()}
						</Button>
					</div>
				{:else}
					<ObservationPhoto {observation} size="medium" class="h-56 w-full" />

					{#if observation.notes}
						<p class="text-sm whitespace-pre-line">{observation.notes}</p>
					{/if}

					<div class="flex flex-col gap-2">
						{#if observation.species.speciesId}
							<Button
								href={resolve('/species/[id]', { id: observation.species.speciesId })}
								variant="outline"
								size="lg"
								onclick={close}
							>
								{m.observation_details_see_species()}
							</Button>
						{/if}
						<Button
							variant="ghost"
							size="lg"
							class="text-destructive"
							onclick={() => (confirming = true)}
						>
							<Trash2Icon data-icon="inline-start" />
							{m.observation_details_delete_observation()}
						</Button>
					</div>
				{/if}
			</div>
		{/if}
	</BottomSheetContent>
</Drawer.Root>
