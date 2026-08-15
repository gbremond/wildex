<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button';
	import MicIcon from '@lucide/svelte/icons/mic';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { openMicrophone } from '../model/capture';
	import { diagnoseMicrophoneError, type MicrophoneDiagnosis } from '../model/microphone-errors';
	import { LiveListener, type HeardSpecies, type LiveTick } from '../model/live';
	import { loadBirdnet, type Where } from '../model/session';
	import { birdnetWeek } from '../model/week';
	import { isBirdnetDownloaded } from '../data/model-cache';
	import ListeningIndicator from './ListeningIndicator.svelte';
	import SpeciesAvatar from '$lib/species/ui/SpeciesAvatar.svelte';

	let { onIdentified }: { onIdentified: (species: HeardSpecies[]) => void } = $props();

	// Keyed by scientific name: the heard list is rebuilt on every tick, so holding
	// the objects themselves would drop the selection each time.
	const selected = new SvelteSet<string>();

	let listener: LiveListener | undefined;
	let listening = $state(false);
	let status = $state('');
	let error = $state<string | undefined>();
	let diagnosis = $state<MicrophoneDiagnosis | undefined>();
	let live = $state<LiveTick | undefined>();

	onDestroy(() => void listener?.stop());

	// Without a fix the range prior cannot narrow anything, so say so rather than
	// silently scoring against all 6522 species.
	async function currentWhere(): Promise<{ where: Where; located: boolean }> {
		const week = birdnetWeek(new Date());

		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) =>
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					timeout: 10000,
					maximumAge: 300000
				})
			);
			return {
				where: {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					week
				},
				located: true
			};
		} catch {
			return { where: { latitude: 0, longitude: 0, week }, located: false };
		}
	}

	async function start() {
		error = undefined;
		diagnosis = undefined;
		live = undefined;

		// getUserMedia has to run while the tap is still fresh.
		let stream: MediaStream;
		try {
			stream = await openMicrophone();
		} catch (cause) {
			error = cause instanceof DOMException ? `${cause.name}: ${cause.message}` : String(cause);
			diagnosis = diagnoseMicrophoneError(cause);
			return;
		}

		try {
			if (!(await isBirdnetDownloaded())) {
				throw new Error('Sound detection is not downloaded yet — get it from the Downloads page.');
			}

			status = 'Loading…';
			const birdnet = await loadBirdnet();
			const { where, located } = await currentWhere();

			listener = new LiveListener(birdnet, where, (tick) => (live = tick));
			await listener.start(stream);
			listening = true;
			status = located ? 'Listening' : 'Listening — no location, results are not filtered';
		} catch (cause) {
			for (const track of stream.getTracks()) track.stop();
			error = cause instanceof Error ? cause.message : String(cause);
		}
	}

	async function stop() {
		listening = false;
		await listener?.stop();
		listener = undefined;
		status = '';
	}

	function toggle(species: HeardSpecies) {
		if (selected.has(species.scientific)) selected.delete(species.scientific);
		else selected.add(species.scientific);
	}

	async function confirmSelection() {
		const chosen = (live?.heard ?? []).filter((species) => selected.has(species.scientific));
		await stop();
		onIdentified(chosen);
	}
</script>

<div class="flex flex-col gap-3 px-4 pb-6">
	{#if !listening}
		<Button size="lg" onclick={start}>
			<MicIcon />
			Start listening
		</Button>
	{:else}
		<Button size="lg" variant="outline" onclick={stop}>
			<ListeningIndicator />
			Stop
		</Button>
	{/if}

	{#if status}
		<p class="text-sm text-muted-foreground">{status}</p>
	{/if}

	{#if error}
		<p class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
	{/if}

	{#if diagnosis}
		<div class="rounded-md border p-3 text-sm">
			<p><span class="font-medium">Cause:</span> {diagnosis.cause}</p>
			<p class="mt-1"><span class="font-medium">Fix:</span> {diagnosis.fix}</p>
		</div>
	{/if}

	{#if live}
		{#if live.heard.length}
			<ul class="flex flex-col gap-2">
				{#each live.heard as species (species.scientific)}
					{@const isSelected = selected.has(species.scientific)}
					<li>
						<button
							type="button"
							aria-pressed={isSelected}
							class="flex w-full items-center gap-3 rounded-2xl border p-2 text-left {isSelected
								? 'border-primary bg-primary/5'
								: ''}"
							onclick={() => toggle(species)}
						>
							<SpeciesAvatar
								seed={species.scientific}
								scientificName={species.scientific}
								fade={false}
								class="size-12 shrink-0 rounded-xl"
							/>
							<span class="min-w-0 flex-1">
								<span class="block font-medium">{species.common}</span>
								<span class="block truncate text-sm text-muted-foreground italic">
									{species.scientific}
								</span>
							</span>
							<span class="shrink-0 text-sm tabular-nums">
								{(species.score * 100).toFixed(0)}%
							</span>
							<span
								class="flex size-6 shrink-0 items-center justify-center rounded-full border {isSelected
									? 'border-primary bg-primary text-primary-foreground'
									: 'border-muted-foreground/40'}"
							>
								{#if isSelected}
									<CheckIcon class="size-4" />
								{/if}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{:else if listening}
			<p class="text-sm text-muted-foreground">
				Nothing confirmed yet — a species needs two separate windows.
			</p>
		{/if}

		{#if selected.size}
			<Button size="lg" onclick={confirmSelection}>
				Add {selected.size} observation{selected.size > 1 ? 's' : ''}
			</Button>
		{/if}

		{#if live.now.length && listening}
			<ul class="flex flex-col gap-1 border-t pt-2">
				{#each live.now as species (species.scientific)}
					<li class="flex items-baseline justify-between gap-2 text-sm text-muted-foreground">
						<span>{species.common}</span>
						<span class="shrink-0 tabular-nums">{(species.score * 100).toFixed(0)}%</span>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>
