<script lang="ts">
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import MicIcon from '@lucide/svelte/icons/mic';
	import { Button } from '$lib/components/ui/button';
	import {
		decodeTo48kMono,
		microphoneEnvironment,
		openMicrophone,
		type MicrophoneEnvironment
	} from '$lib/birdnet/model/capture';
	import {
		diagnoseMicrophoneError,
		type MicrophoneDiagnosis
	} from '$lib/birdnet/model/microphone-errors';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { resolve } from '$app/paths';
	import { LiveListener, type LiveTick } from '$lib/birdnet/model/live';
	import ListeningIndicator from '$lib/birdnet/ui/ListeningIndicator.svelte';
	import { findSpeciesByScientificName, loadSpeciesInMemory } from '$lib/species/data/repository';
	import SpeciesAvatar from '$lib/species/ui/SpeciesAvatar.svelte';
	import type { Species } from '$lib/species/model/model';
	import { loadBirdnet, type Identification, type Where } from '$lib/birdnet/model/session';
	import { birdnetWeek } from '$lib/birdnet/model/week';

	let listener: LiveListener | undefined;
	let live = $state<LiveTick | undefined>();
	let listening = $state(false);

	// BirdNET knows 6522 species; only the ones the user downloaded have a local
	// record, and so a page to link to.
	const localByName = new SvelteMap<string, Species>();

	onMount(loadSpeciesInMemory);

	async function rememberLocalSpecies(scientific: string) {
		if (localByName.has(scientific)) return;
		const species = await findSpeciesByScientificName(scientific);
		if (species) localByName.set(scientific, species);
	}

	const elapsed = (seconds: number) =>
		`${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

	async function toggleListening() {
		if (listening) {
			listening = false;
			await listener?.stop();
			listener = undefined;
			status = 'Stopped';
			return;
		}

		error = undefined;
		diagnosis = undefined;
		result = undefined;
		live = undefined;

		// The microphone must be opened while the tap is still fresh.
		let stream: MediaStream;
		try {
			stream = await openMicrophone();
		} catch (cause) {
			error = cause instanceof DOMException ? `${cause.name}: ${cause.message}` : String(cause);
			await probeMicrophone();
			diagnosis = diagnoseMicrophoneError(cause);
			return;
		}

		try {
			status = 'Loading models…';
			const birdnet = await loadBirdnet();
			listener = new LiveListener(birdnet, where(), (tick) => {
				live = tick;
				for (const species of tick.heard) void rememberLocalSpecies(species.scientific);
			});
			await listener.start(stream);
			listening = true;
			status = 'Listening';
		} catch (cause) {
			for (const track of stream.getTracks()) track.stop();
			error = cause instanceof Error ? cause.message : String(cause);
			status = 'Failed';
		}
	}

	let status = $state('Idle');
	let busy = $state(false);
	let error = $state<string | undefined>();
	let diagnosis = $state<MicrophoneDiagnosis | undefined>();
	let environment = $state<MicrophoneEnvironment | undefined>();
	let result = $state<Identification | undefined>();
	let decodeMs = $state(0);
	let locating = $state(false);

	async function probeMicrophone() {
		environment = await microphoneEnvironment();
	}

	let latitude = $state(48.8566);
	let longitude = $state(2.3522);
	let week = $state(birdnetWeek(new Date()));

	const where = (): Where => ({ latitude, longitude, week });

	async function identify(source: () => Promise<ArrayBuffer>, label: string) {
		busy = true;
		error = undefined;
		diagnosis = undefined;
		result = undefined;
		try {
			status = 'Loading models…';
			const birdnet = await loadBirdnet();

			status = label;
			const data = await source();

			status = 'Decoding to 48 kHz…';
			const startedDecode = performance.now();
			const pcm = await decodeTo48kMono(data);
			decodeMs = performance.now() - startedDecode;

			status = 'Running BirdNET…';
			result = await birdnet.identify(pcm, where());
			status = 'Done';
		} catch (cause) {
			// The DOMException name carries which layer refused; the message alone does not.
			error = cause instanceof DOMException ? `${cause.name}: ${cause.message}` : String(cause);
			status = 'Failed';
		} finally {
			busy = false;
		}
	}

	function pickFile(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (file) identify(() => file.arrayBuffer(), `Reading ${file.name}…`);
	}

	function useCurrentPosition() {
		locating = true;
		navigator.geolocation.getCurrentPosition(
			(position) => {
				latitude = Number(position.coords.latitude.toFixed(4));
				longitude = Number(position.coords.longitude.toFixed(4));
				locating = false;
			},
			(cause) => {
				error = cause.message;
				locating = false;
			},
			// Without a timeout a cold GPS fix can hang forever, and the spinner with
			// it. A minute-old position is plenty precise for a range prior.
			{ timeout: 15000, maximumAge: 60000 }
		);
	}
</script>

<div class="mx-auto max-w-120 p-4 pb-(--bottom-nav-clearance)">
	<h1 class="text-3xl">BirdNET spike</h1>
	<p class="mt-2 text-muted-foreground">
		Offline bird call identification. 6,522 species, gated by location and week.
	</p>

	<div class="mt-6 grid grid-cols-3 gap-2">
		<label class="text-sm">
			Latitude
			<input
				type="number"
				step="0.0001"
				bind:value={latitude}
				class="mt-1 w-full rounded-md border px-2 py-1"
			/>
		</label>
		<label class="text-sm">
			Longitude
			<input
				type="number"
				step="0.0001"
				bind:value={longitude}
				class="mt-1 w-full rounded-md border px-2 py-1"
			/>
		</label>
		<label class="text-sm">
			Week (1–48)
			<input
				type="number"
				min="1"
				max="48"
				bind:value={week}
				class="mt-1 w-full rounded-md border px-2 py-1"
			/>
		</label>
	</div>

	<Button variant="outline" size="sm" class="mt-2" onclick={useCurrentPosition} disabled={locating}>
		{#if locating}
			<LoaderCircleIcon class="animate-spin" />
			Locating…
		{:else}
			Use my position
		{/if}
	</Button>

	<div class="mt-6 flex flex-col gap-2">
		<Button onclick={toggleListening} disabled={busy}>
			{#if listening}
				<ListeningIndicator />
				Stop listening
			{:else}
				<MicIcon />
				Listen live
			{/if}
		</Button>

		{#if live}
			<div class="rounded-md border p-3">
				<h2 class="text-sm font-medium">Heard</h2>
				{#if live.heard.length}
					<ul class="mt-2 flex flex-col gap-2">
						{#each live.heard as species (species.scientific)}
							{@const local = localByName.get(species.scientific)}
							<li class="flex items-center gap-3">
								<SpeciesAvatar
									seed={local?.id ?? species.scientific}
									scientificName={species.scientific}
									fade={false}
									class="size-12 shrink-0 rounded-md"
								/>
								<span class="min-w-0 flex-1">
									{#if local}
										<a
											href={resolve('/species/[id]', { id: local.id })}
											class="font-medium underline underline-offset-2"
										>
											{species.common}
										</a>
									{:else}
										<span class="font-medium">{species.common}</span>
									{/if}
									<span class="block truncate text-sm text-muted-foreground italic">
										{species.scientific}
									</span>
								</span>
								<span class="shrink-0 text-right text-sm tabular-nums">
									{(species.score * 100).toFixed(0)}%
									<span class="block text-xs text-muted-foreground">
										at {elapsed(species.firstHeardSeconds)}
									</span>
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mt-2 text-sm text-muted-foreground">
						Nothing confirmed yet — a species needs two separate windows.
					</p>
				{/if}

				{#if live.now.length}
					<div class="mt-3 border-t pt-2">
						<h3 class="text-xs text-muted-foreground">Now</h3>
						<ul class="mt-1 flex flex-col gap-1">
							{#each live.now as species (species.scientific)}
								<li class="flex items-baseline justify-between gap-2 text-sm text-muted-foreground">
									<span>{species.common}</span>
									<span class="shrink-0 tabular-nums">{(species.score * 100).toFixed(0)}%</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<p class="mt-2 text-xs text-muted-foreground tabular-nums">
					{live.windows} windows · {live.lastInferenceMs.toFixed(0)} ms last
					{#if live.dropped}· {live.dropped} dropped{/if}
				</p>
			</div>
		{/if}

		<label class="text-sm text-muted-foreground">
			…or pick an audio file (the oracle — use it whenever the mic looks wrong)
			<input
				type="file"
				accept="audio/*"
				onchange={pickFile}
				disabled={busy}
				class="mt-1 w-full text-sm"
			/>
		</label>
	</div>

	<p class="mt-4 text-sm">
		Status: <span class="font-medium">{status}</span>
	</p>

	{#if error}
		<p class="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
	{/if}

	{#if diagnosis}
		<div class="mt-2 rounded-md border p-3 text-sm">
			<p><span class="font-medium">Cause:</span> {diagnosis.cause}</p>
			<p class="mt-1"><span class="font-medium">Fix:</span> {diagnosis.fix}</p>
		</div>
	{/if}

	<details class="mt-4 text-sm">
		<summary class="cursor-pointer text-muted-foreground" onclick={probeMicrophone}>
			Microphone diagnostics
		</summary>
		{#if environment}
			<dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
				<dt>origin</dt>
				<dd class="break-all">{environment.origin}</dd>
				<dt>secure context</dt>
				<dd>{environment.secureContext ? 'yes' : 'NO — getUserMedia needs HTTPS'}</dd>
				<dt>mediaDevices</dt>
				<dd>{environment.hasMediaDevices ? 'present' : 'MISSING'}</dd>
				<dt>permission</dt>
				<dd>{environment.permission}</dd>
			</dl>
		{:else}
			<p class="mt-2 text-muted-foreground">Opening this panel reads the current state.</p>
		{/if}
	</details>

	{#if result}
		<ul class="mt-4 flex flex-col gap-2">
			{#each result.species as species (species.scientific)}
				<li class="flex items-baseline justify-between rounded-md border p-3">
					<span>
						<span class="font-medium">{species.common}</span>
						<span class="block text-sm text-muted-foreground italic">{species.scientific}</span>
					</span>
					<span class="tabular-nums">{(species.score * 100).toFixed(1)}%</span>
				</li>
			{:else}
				<li class="text-muted-foreground">No species above the location filter.</li>
			{/each}
		</ul>

		<p class="mt-4 text-sm text-muted-foreground tabular-nums">
			{result.chunks} chunks · decode {decodeMs.toFixed(0)} ms · inference
			{result.inferenceMs.toFixed(0)} ms ({(result.inferenceMs / result.chunks).toFixed(0)} ms/chunk)
			· {result.plausible}/6522 species plausible here
		</p>
	{/if}
</div>
