<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Item from '$lib/components/ui/item';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import CameraIcon from '@lucide/svelte/icons/camera';
	import ImageIcon from '@lucide/svelte/icons/image';
	import MicIcon from '@lucide/svelte/icons/mic';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import {
		IDENTIFICATION_OPTIONS,
		captureAccept,
		type IdentificationOption,
		type IdentificationOptionId
	} from '../model/identification';
	import { canSubmitObservations, toObservations, toDateInputValue } from '../model/draft';
	import SoundIdentification from '$lib/birdnet/ui/SoundIdentification.svelte';
	import type { HeardSpecies } from '$lib/birdnet/model/live';

	let {
		open = $bindable(false),
		trigger
	}: { open?: boolean; trigger: Snippet<[Record<string, unknown>]> } = $props();

	const OPTION_ICONS: Record<IdentificationOptionId, Component> = {
		camera: CameraIcon,
		gallery: ImageIcon,
		sound: MicIcon,
		manual: PencilIcon
	};

	let chosen = $state<IdentificationOption | null>(null);
	let species = $state('');
	let observedOn = $state(toDateInputValue(new Date()));
	let notes = $state('');
	let capture = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let stepHeight = $state(0);
	let listening = $state(false);
	let heard = $state<HeardSpecies[]>([]);

	let captureInput: HTMLInputElement;
	let awaitedOption: IdentificationOption | null = null;

	let accept = $derived(chosen === null ? null : captureAccept(chosen.method));

	// A listening session can turn up several birds, each its own sighting; every
	// other method produces exactly one.
	let drafts = $derived.by(() => {
		if (chosen === null) return [];
		const shared = { method: chosen.method, observedOn, notes };

		return heard.length > 1
			? toObservations(
					shared,
					heard.map((species) => ({ species: species.common, capture: species.evidence }))
				)
			: [{ ...shared, species, capture }];
	});

	let canSubmit = $derived(canSubmitObservations(drafts));

	// Revokes the previous URL whenever the capture changes, and the last one when
	// the sheet is torn down.
	$effect(() => {
		const url = previewUrl;
		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	});

	function resetDraft() {
		chosen = null;
		species = '';
		observedOn = toDateInputValue(new Date());
		notes = '';
		capture = null;
		previewUrl = null;
		awaitedOption = null;
		listening = false;
		heard = [];
	}

	function openCapturePicker(option: IdentificationOption, needs: string) {
		awaitedOption = option;

		// These writes have to land before click(): the picker only opens inside
		// this user gesture, so waiting for Svelte to flush state would be too late.
		captureInput.accept = needs;
		if (option.wantsCamera) captureInput.setAttribute('capture', 'environment');
		else captureInput.removeAttribute('capture');
		// Clearing the value lets the same file be picked twice in a row.
		captureInput.value = '';

		captureInput.click();
	}

	function chooseOption(option: IdentificationOption) {
		// Sound is identified live rather than from a file: the model listens, and
		// hands back the window that confirmed the species as the capture.
		if (option.method === 'sound') {
			chosen = option;
			listening = true;
			return;
		}

		const needs = captureAccept(option.method);

		if (needs === null) {
			chosen = option;
			return;
		}

		openCapturePicker(option, needs);
	}

	function onSpeciesHeard(chosen: HeardSpecies[]) {
		if (chosen.length === 0) return;

		heard = chosen;
		// The single-species case still fills the editable field, so a misheard
		// bird can be corrected before saving.
		species = chosen.length === 1 ? chosen[0].common : '';
		capture = chosen[0].evidence;
		previewUrl = URL.createObjectURL(chosen[0].evidence);
		listening = false;
	}

	// The form is only worth showing once there is something to identify, so the
	// step advances here rather than on the option click. Cancelling the picker
	// fires no change event, which leaves the sheet on the option list.
	function onCaptureChosen(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;

		capture = file;
		previewUrl = URL.createObjectURL(file);
		chosen = awaitedOption;
	}

	function backToOptions() {
		chosen = null;
		capture = null;
		previewUrl = null;
		awaitedOption = null;
		listening = false;
		heard = [];
	}
</script>

{#snippet optionList()}
	<Drawer.Header>
		<Drawer.Title>New observation</Drawer.Title>
		<Drawer.Description>How do you want to identify the species?</Drawer.Description>
	</Drawer.Header>

	<Item.Group class="gap-2 px-4 pb-6">
		{#each IDENTIFICATION_OPTIONS as option (option.id)}
			{@const Icon = OPTION_ICONS[option.id]}
			<Item.Root variant="outline">
				{#snippet child({ props })}
					<button {...props} type="button" onclick={() => chooseOption(option)}>
						<Item.Media variant="icon">
							<Icon aria-hidden="true" focusable="false" class="size-5" />
						</Item.Media>
						<Item.Content>
							<Item.Title>{option.label}</Item.Title>
							<Item.Description>{option.hint}</Item.Description>
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
{/snippet}

{#snippet listenStep(option: IdentificationOption)}
	<Drawer.Header
		class="flex-row items-center gap-1 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left"
	>
		<Button
			variant="ghost"
			size="icon-sm"
			class="rounded-full"
			onclick={backToOptions}
			aria-label="Back to identification methods"
		>
			<ChevronLeftIcon aria-hidden="true" focusable="false" />
		</Button>
		<div class="flex flex-col">
			<Drawer.Title>{option.label}</Drawer.Title>
			<Drawer.Description>Tap every species you heard</Drawer.Description>
		</div>
	</Drawer.Header>

	<SoundIdentification onIdentified={onSpeciesHeard} />
{/snippet}

{#snippet observationForm(option: IdentificationOption)}
	<Drawer.Header
		class="flex-row items-center gap-1 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left"
	>
		<Button
			variant="ghost"
			size="icon-sm"
			class="rounded-full"
			onclick={backToOptions}
			aria-label="Back to identification methods"
		>
			<ChevronLeftIcon aria-hidden="true" focusable="false" />
		</Button>
		<div class="flex flex-col">
			<Drawer.Title>{option.label}</Drawer.Title>
			<Drawer.Description>{option.hint}</Drawer.Description>
		</div>
	</Drawer.Header>

	<form
		data-vaul-no-drag
		class="flex flex-col gap-4 px-4 pb-6"
		onsubmit={(event) => event.preventDefault()}
	>
		<!-- Hidden for a batch: there is one recording per species, so showing the
		     first one alone reads as if it were the evidence for all of them. -->
		{#if accept && previewUrl && heard.length <= 1}
			<div class="flex flex-col gap-1.5">
				{#if option.method === 'photo'}
					<!-- Fixed height so the sheet does not resize again once the image loads. -->
					<div class="h-48 overflow-hidden rounded-2xl bg-muted/50">
						<img
							src={previewUrl}
							alt="Attached to this observation"
							class="size-full object-contain"
						/>
					</div>
				{:else}
					<audio src={previewUrl} controls class="w-full"></audio>
				{/if}

				<div class="flex items-center gap-2 pl-3 text-sm">
					<span class="min-w-0 flex-1 truncate text-muted-foreground">{capture?.name}</span>
					<Button
						variant="ghost"
						size="sm"
						class="rounded-xl"
						onclick={() =>
							option.method === 'sound' ? (listening = true) : openCapturePicker(option, accept)}
					>
						Change
					</Button>
				</div>
			</div>
		{/if}

		{#if heard.length > 1}
			<div class="flex flex-col gap-1.5">
				<span class="text-sm font-medium">{heard.length} species heard</span>
				<ul class="flex flex-col gap-1 rounded-2xl border p-2">
					{#each heard as species (species.scientific)}
						<li class="flex items-baseline justify-between gap-2 text-sm">
							<span>
								{species.common}
								<span class="text-muted-foreground italic">{species.scientific}</span>
							</span>
							<span class="shrink-0 tabular-nums">{(species.score * 100).toFixed(0)}%</span>
						</li>
					{/each}
				</ul>
				<p class="text-xs text-muted-foreground">
					Saved as {heard.length} separate observations, each with its own recording.
				</p>
			</div>
		{:else}
			<div class="flex flex-col gap-1.5">
				<label for="observation-species" class="text-sm font-medium">Species</label>
				<Input
					id="observation-species"
					bind:value={species}
					placeholder="Common kingfisher"
					autocomplete="off"
				/>
			</div>
		{/if}

		<div class="flex flex-col gap-1.5">
			<label for="observation-date" class="text-sm font-medium">Date</label>
			<Input id="observation-date" type="date" bind:value={observedOn} />
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="observation-notes" class="text-sm font-medium">Notes</label>
			<Textarea id="observation-notes" bind:value={notes} placeholder="Behaviour, weather, count" />
		</div>

		<Button type="submit" size="lg" disabled={!canSubmit}>
			Save {drafts.length > 1 ? `${drafts.length} observations` : 'observation'}
		</Button>
	</form>
{/snippet}

<Drawer.Root bind:open onOpenChange={(isOpen) => isOpen && resetDraft()}>
	<Drawer.Trigger>
		{#snippet child({ props })}
			{@render trigger(props)}
		{/snippet}
	</Drawer.Trigger>

	<Drawer.Content
		class="mx-auto max-w-120 rounded-t-3xl border border-b-0 bg-card p-0 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-4px_rgb(0_0_0/0.15)] before:hidden"
	>
		<!-- Hidden, and driven by the option and Change buttons, which set `accept`
		     and `capture` on it to open the camera or the gallery. -->
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
				{#if chosen === null}
					{@render optionList()}
				{:else if listening}
					{@render listenStep(chosen)}
				{:else}
					{@render observationForm(chosen)}
				{/if}
			</div>
		</div>
	</Drawer.Content>
</Drawer.Root>
