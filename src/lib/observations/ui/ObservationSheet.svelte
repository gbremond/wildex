<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { speciesName } from '$lib/species/model/names';
	import type { Snippet } from 'svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import BottomSheetContent from '$lib/components/BottomSheetContent.svelte';
	import ImagePlusIcon from '@lucide/svelte/icons/image-plus';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import { currentPosition, type Position } from '$lib/geolocation';
	import { localDateTime } from '$lib/local-date';
	import type { Species } from '$lib/species/model/model';
	import SoundIdentification from '$lib/birdnet/ui/SoundIdentification.svelte';
	import type { HeardSpecies } from '$lib/birdnet/model/live';
	import {
		IDENTIFICATION_OPTIONS,
		captureAccept,
		type IdentificationOption
	} from '../model/identification';
	import {
		canSubmitObservations,
		toObservation,
		toObservations,
		wasSeenJustNow,
		whereSeen
	} from '../model/draft';
	import { tripAt } from '../model/trip';
	import { observedSpeciesFrom, type ObservedSpecies } from '../model/observation';
	import { journal } from '../data/journal.svelte';
	import { toObservedSpecies } from '../data/heard-species';
	import IdentificationOptions from './IdentificationOptions.svelte';
	import SpeciesPicker from './SpeciesPicker.svelte';
	import HeardSpeciesList from './HeardSpeciesList.svelte';
	import TripSelect from './TripSelect.svelte';
	import { IDENTIFICATION_COPY } from './identification-copy';
	import { m } from '$lib/paraglide/messages';

	let {
		open = $bindable(false),
		presetSpecies,
		trigger
	}: {
		open?: boolean;
		/** Set when opened from a species card: skips straight to the form. */
		presetSpecies?: Species;
		trigger: Snippet<[Record<string, unknown>]>;
	} = $props();

	const MANUAL_OPTION = IDENTIFICATION_OPTIONS.find((option) => option.method === 'manual')!;

	type HeardObservation = { species: ObservedSpecies; score: number; capture: File };

	let chosenOption = $state<IdentificationOption | null>(null);
	let species = $state<ObservedSpecies>({ name: '' });
	let observedAt = $state(localDateTime(new Date()));
	let notes = $state('');
	let capture = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let stepHeight = $state(0);
	let listening = $state(false);
	let heard = $state<HeardObservation[]>([]);
	let saving = $state(false);

	let captureInput: HTMLInputElement;
	let awaitedOption: IdentificationOption | null = null;
	// Asked for on open: a GPS fix takes seconds.
	let positionFix: Promise<Position | null> = Promise.resolve(null);

	// A listening session can turn up several birds, each its own observation.
	let drafts = $derived.by(() => {
		if (chosenOption === null) return [];
		const shared = { method: chosenOption.method, observedAt, notes };

		return heard.length > 1 ? toObservations(shared, heard) : [{ ...shared, species, capture }];
	});

	let canSubmit = $derived(!saving && canSubmitObservations(drafts));

	// Defaults to the trip of the chosen day; the form can override it.
	let tripId = $derived(
		observedAt ? (tripAt(journal.trips, new Date(observedAt).toISOString())?.id ?? '') : ''
	);

	// Revokes the previous URL whenever the capture changes, and the last one on teardown.
	$effect(() => {
		const url = previewUrl;
		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	});

	function resetDraft() {
		backToOptions();
		chosenOption = presetSpecies ? MANUAL_OPTION : null;
		species = presetSpecies ? observedSpeciesFrom(presetSpecies) : { name: '' };
		observedAt = localDateTime(new Date());
		notes = '';
		saving = false;
		positionFix = currentPosition();
	}

	function attach(file: File | null) {
		capture = file;
		previewUrl = file ? URL.createObjectURL(file) : null;
	}

	function openCapturePicker(option: IdentificationOption, accept: string) {
		awaitedOption = option;

		// Set before click(): the picker only opens inside this user gesture.
		captureInput.accept = accept;
		if (option.wantsCamera) captureInput.setAttribute('capture', 'environment');
		else captureInput.removeAttribute('capture');
		// Clearing the value lets the same file be picked twice in a row.
		captureInput.value = '';

		captureInput.click();
	}

	function chooseOption(option: IdentificationOption) {
		// Sound is identified live; the window that confirmed a species becomes its capture.
		if (option.method === 'sound') {
			chosenOption = option;
			listening = true;
			return;
		}

		const accept = captureAccept(option.method);

		if (accept === null) {
			chosenOption = option;
			return;
		}

		openCapturePicker(option, accept);
	}

	async function onSpeciesHeard(heardSpecies: HeardSpecies[]) {
		if (heardSpecies.length === 0) return;

		heard = await Promise.all(
			heardSpecies.map(async (bird) => ({
				species: await toObservedSpecies(bird),
				score: bird.score,
				capture: bird.evidence
			}))
		);
		// A single species still fills the editable field, so a misheard bird can be fixed.
		species = heard.length === 1 ? heard[0].species : { name: '' };
		attach(heard[0].capture);
		listening = false;
	}

	// Cancelling the picker fires no change event, so the sheet stays where it was.
	function onCaptureChosen(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;

		attach(file);
		chosenOption = awaitedOption;
	}

	function backToOptions() {
		chosenOption = null;
		attach(null);
		awaitedOption = null;
		listening = false;
		heard = [];
	}

	async function save() {
		saving = true;

		try {
			const now = new Date();
			const here = wasSeenJustNow(observedAt, now) ? await positionFix : null;
			const trip = journal.trips.find(({ id }) => id === tripId);
			const context = {
				position: whereSeen({ observedAt, now, here, trip }),
				tripId: trip?.id ?? null
			};

			await journal.add(drafts.map((draft) => toObservation(draft, context)));
			open = false;
		} finally {
			saving = false;
		}
	}
</script>

{#snippet stepHeader(title: string, description: string)}
	<Drawer.Header
		class="flex-row items-center gap-1 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left"
	>
		{#if !presetSpecies}
			<Button
				variant="ghost"
				size="icon-sm"
				class="rounded-full"
				onclick={backToOptions}
				aria-label={m.observation_form_back()}
			>
				<ChevronLeftIcon aria-hidden="true" focusable="false" />
			</Button>
		{/if}
		<div class="flex flex-col">
			<Drawer.Title>{title}</Drawer.Title>
			<Drawer.Description>{description}</Drawer.Description>
		</div>
	</Drawer.Header>
{/snippet}

{#snippet capturePreview(option: IdentificationOption)}
	<div class="flex flex-col gap-1.5">
		{#if capture?.type.startsWith('audio/')}
			<audio src={previewUrl} controls class="w-full"></audio>
		{:else}
			<!-- Fixed height so the sheet does not resize again once the image loads. -->
			<div class="h-48 overflow-hidden rounded-2xl bg-muted/50">
				<img
					src={previewUrl}
					alt={m.observation_form_capture_alt()}
					class="size-full object-contain"
				/>
			</div>
		{/if}

		<div class="flex items-center gap-2 pl-3 text-sm">
			<span class="min-w-0 flex-1 truncate text-muted-foreground">{capture?.name}</span>
			<!-- A manual observation has no capture method of its own: its photo is optional. -->
			<Button
				variant="ghost"
				size="sm"
				class="rounded-xl"
				onclick={() =>
					option.method === 'sound'
						? (listening = true)
						: openCapturePicker(option, captureAccept(option.method) ?? 'image/*')}
			>
				{m.observation_form_change_capture()}
			</Button>
		</div>
	</div>
{/snippet}

{#snippet observationForm(option: IdentificationOption)}
	{#if presetSpecies}
		{@render stepHeader(speciesName(presetSpecies, getLocale()), m.observation_form_preset_hint())}
	{:else}
		{@render stepHeader(
			IDENTIFICATION_COPY[option.id].label(),
			IDENTIFICATION_COPY[option.id].hint()
		)}
	{/if}

	<form
		data-vaul-no-drag
		class="flex flex-col gap-4 px-4 pb-6"
		onsubmit={(event) => {
			event.preventDefault();
			save();
		}}
	>
		<!-- Hidden for a batch: one recording shown alone would read as the evidence for all. -->
		{#if previewUrl && heard.length <= 1}
			{@render capturePreview(option)}
		{:else if option.method === 'manual'}
			<Button
				variant="outline"
				class="rounded-xl border-dashed bg-transparent text-muted-foreground"
				onclick={() => openCapturePicker(option, 'image/*')}
			>
				<ImagePlusIcon />
				{m.observation_form_add_photo()}
			</Button>
		{/if}

		{#if heard.length > 1}
			<HeardSpeciesList {heard} />
		{:else if !presetSpecies}
			<SpeciesPicker bind:species />
		{/if}

		<div class="flex flex-col gap-1.5">
			<label for="observation-date" class="text-sm font-medium">{m.observation_form_when()}</label>
			<Input id="observation-date" type="datetime-local" bind:value={observedAt} />
		</div>

		<TripSelect bind:value={tripId} />

		<div class="flex flex-col gap-1.5">
			<label for="observation-notes" class="text-sm font-medium">
				{m.observation_form_notes()}
			</label>
			<Textarea
				id="observation-notes"
				bind:value={notes}
				placeholder={m.observation_form_notes_placeholder()}
			/>
		</div>

		<Button type="submit" size="lg" disabled={!canSubmit}>
			{#if saving}
				{m.observation_form_saving()}
			{:else}
				{m.observation_form_save({ count: drafts.length })}
			{/if}
		</Button>
	</form>
{/snippet}

<Drawer.Root bind:open onOpenChange={(isOpen) => isOpen && resetDraft()}>
	<Drawer.Trigger>
		{#snippet child({ props })}
			{@render trigger(props)}
		{/snippet}
	</Drawer.Trigger>

	<BottomSheetContent>
		<!-- Driven by the option, Add a photo and Change buttons to open the camera or gallery. -->
		<input
			bind:this={captureInput}
			onchange={onCaptureChosen}
			type="file"
			tabindex="-1"
			class="hidden"
		/>

		<div
			class="max-h-[70vh] overflow-y-auto transition-[height] duration-300 ease-out"
			style:height="{stepHeight}px"
		>
			<div bind:clientHeight={stepHeight}>
				{#if chosenOption === null}
					<IdentificationOptions onChoose={chooseOption} />
				{:else if listening}
					{@render stepHeader(IDENTIFICATION_COPY[chosenOption.id].label(), m.sound_step_hint())}
					<SoundIdentification onIdentified={onSpeciesHeard} />
				{:else}
					{@render observationForm(chosenOption)}
				{/if}
			</div>
		</div>
	</BottomSheetContent>
</Drawer.Root>
