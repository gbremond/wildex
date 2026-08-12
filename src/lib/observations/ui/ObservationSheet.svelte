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
	import { canSubmitObservation, toDateInputValue } from '../model/draft';

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

	let captureInput: HTMLInputElement;
	let awaitedOption: IdentificationOption | null = null;

	let accept = $derived(chosen === null ? null : captureAccept(chosen.method));
	let canSubmit = $derived(
		chosen !== null &&
			canSubmitObservation({ method: chosen.method, species, observedOn, notes, capture })
	);

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
		const needs = captureAccept(option.method);

		if (needs === null) {
			chosen = option;
			return;
		}

		openCapturePicker(option, needs);
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
		{#if accept && previewUrl}
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
						onclick={() => openCapturePicker(option, accept)}
					>
						Change
					</Button>
				</div>
			</div>
		{/if}

		<div class="flex flex-col gap-1.5">
			<label for="observation-species" class="text-sm font-medium">Species</label>
			<Input
				id="observation-species"
				bind:value={species}
				placeholder="Common kingfisher"
				autocomplete="off"
			/>
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="observation-date" class="text-sm font-medium">Date</label>
			<Input id="observation-date" type="date" bind:value={observedOn} />
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="observation-notes" class="text-sm font-medium">Notes</label>
			<Textarea id="observation-notes" bind:value={notes} placeholder="Behaviour, weather, count" />
		</div>

		<Button type="submit" size="lg" disabled={!canSubmit}>Save observation</Button>
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
				{:else}
					{@render observationForm(chosen)}
				{/if}
			</div>
		</div>
	</Drawer.Content>
</Drawer.Root>
