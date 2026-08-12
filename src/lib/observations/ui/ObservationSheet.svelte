<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Item from '$lib/components/ui/item';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import CameraIcon from '@lucide/svelte/icons/camera';
	import MicIcon from '@lucide/svelte/icons/mic';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import {
		IDENTIFICATION_OPTIONS,
		captureAccept,
		identificationOption,
		type IdentificationMethod
	} from '../model/identification';
	import { canSubmitObservation, toDateInputValue } from '../model/draft';

	let {
		open = $bindable(false),
		trigger
	}: { open?: boolean; trigger: Snippet<[Record<string, unknown>]> } = $props();

	const METHOD_ICONS: Record<IdentificationMethod, Component> = {
		photo: CameraIcon,
		sound: MicIcon,
		manual: PencilIcon
	};

	let method = $state<IdentificationMethod | null>(null);
	let species = $state('');
	let observedOn = $state(toDateInputValue(new Date()));
	let notes = $state('');
	let capture = $state<File | null>(null);
	let stepHeight = $state(0);

	let captureInput: HTMLInputElement;
	let awaitedMethod: IdentificationMethod | null = null;

	let accept = $derived(method === null ? null : captureAccept(method));
	let canSubmit = $derived(
		method !== null && canSubmitObservation({ method, species, observedOn, notes, capture })
	);

	function resetDraft() {
		method = null;
		species = '';
		observedOn = toDateInputValue(new Date());
		notes = '';
		capture = null;
		awaitedMethod = null;
	}

	function openCapturePicker(target: IdentificationMethod, needs: string) {
		awaitedMethod = target;
		// Both writes have to land before click(): the picker only opens inside this
		// user gesture, so waiting for Svelte to flush state would be too late.
		// Clearing the value lets the same file be picked twice in a row.
		captureInput.accept = needs;
		captureInput.value = '';
		captureInput.click();
	}

	function chooseMethod(chosen: IdentificationMethod) {
		const needs = captureAccept(chosen);

		if (needs === null) {
			method = chosen;
			return;
		}

		openCapturePicker(chosen, needs);
	}

	// The form is only worth showing once there is something to identify, so the
	// step advances here rather than on the option click. Cancelling the picker
	// fires no change event, which leaves the sheet on the option list.
	function onCaptureChosen(event: Event) {
		const chosen = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!chosen) return;

		capture = chosen;
		method = awaitedMethod;
	}

	function backToMethodChoice() {
		method = null;
		capture = null;
		awaitedMethod = null;
	}
</script>

{#snippet methodChoice()}
	<Drawer.Header>
		<Drawer.Title>New observation</Drawer.Title>
		<Drawer.Description>How do you want to identify the species?</Drawer.Description>
	</Drawer.Header>

	<Item.Group class="gap-2 px-4 pb-6">
		{#each IDENTIFICATION_OPTIONS as option (option.method)}
			{@const Icon = METHOD_ICONS[option.method]}
			<Item.Root variant="outline">
				{#snippet child({ props })}
					<button {...props} type="button" onclick={() => chooseMethod(option.method)}>
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

{#snippet observationForm(chosen: IdentificationMethod)}
	{@const option = identificationOption(chosen)}
	<Drawer.Header
		class="flex-row items-center gap-1 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left"
	>
		<Button
			variant="ghost"
			size="icon-sm"
			class="rounded-full"
			onclick={backToMethodChoice}
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
		{#if accept}
			<div class="flex flex-col gap-1.5">
				<span class="text-sm font-medium">{chosen === 'photo' ? 'Picture' : 'Sound'}</span>
				<div class="flex items-center gap-2 rounded-2xl bg-input/50 py-1.5 pr-1.5 pl-3">
					<span class="min-w-0 flex-1 truncate text-sm">
						{capture?.name ?? 'Nothing attached'}
					</span>
					<Button
						variant="ghost"
						size="sm"
						class="rounded-xl"
						onclick={() => openCapturePicker(chosen, accept)}
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
		<!-- Hidden, and driven by the option and Change buttons: with no `capture`
		     attribute the native picker offers the camera as well as the library,
		     and falls back to a file dialog on desktop. -->
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
				{#if method === null}
					{@render methodChoice()}
				{:else}
					{@render observationForm(method)}
				{/if}
			</div>
		</div>
	</Drawer.Content>
</Drawer.Root>
