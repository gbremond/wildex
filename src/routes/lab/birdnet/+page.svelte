<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { decodeTo48kMono, recordFromMicrophone } from '$lib/birdnet/model/capture';
	import { loadBirdnet, type Identification, type Where } from '$lib/birdnet/model/session';
	import { birdnetWeek } from '$lib/birdnet/model/week';

	const RECORD_SECONDS = 9;

	let status = $state('Idle');
	let busy = $state(false);
	let error = $state<string | undefined>();
	let result = $state<Identification | undefined>();
	let decodeMs = $state(0);

	let latitude = $state(48.8566);
	let longitude = $state(2.3522);
	let week = $state(birdnetWeek(new Date()));

	const where = (): Where => ({ latitude, longitude, week });

	async function identify(source: () => Promise<ArrayBuffer>, label: string) {
		busy = true;
		error = undefined;
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
			error = cause instanceof Error ? cause.message : String(cause);
			status = 'Failed';
		} finally {
			busy = false;
		}
	}

	function pickFile(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (file) identify(() => file.arrayBuffer(), `Reading ${file.name}…`);
	}

	function useMicrophone() {
		identify(() => recordFromMicrophone(RECORD_SECONDS), `Recording ${RECORD_SECONDS}s…`);
	}

	function useCurrentPosition() {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				latitude = Number(position.coords.latitude.toFixed(4));
				longitude = Number(position.coords.longitude.toFixed(4));
			},
			(cause) => (error = cause.message)
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

	<Button variant="outline" size="sm" class="mt-2" onclick={useCurrentPosition}>
		Use my position
	</Button>

	<div class="mt-6 flex flex-col gap-2">
		<Button onclick={useMicrophone} disabled={busy}>
			Record {RECORD_SECONDS}s from microphone
		</Button>

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
