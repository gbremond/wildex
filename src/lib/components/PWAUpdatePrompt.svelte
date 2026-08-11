<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Item,
		ItemMedia,
		ItemContent,
		ItemTitle,
		ItemDescription,
		ItemActions
	} from '$lib/components/ui/item';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';

	let waitingWorker = $state<ServiceWorker | null>(null);

	function promptIfUpdate(worker: ServiceWorker) {
		if (navigator.serviceWorker.controller) waitingWorker = worker;
	}

	function promptWhenSWInstalled(worker: ServiceWorker) {
		if (worker.state === 'installed') {
			promptIfUpdate(worker);
			return;
		}

		worker.addEventListener('statechange', () => {
			if (worker.state === 'installed') promptIfUpdate(worker);
		});
	}

	async function watchForUpdate() {
		if (!('serviceWorker' in navigator)) return;

		const registration = await navigator.serviceWorker.ready;
		const pending = registration.waiting ?? registration.installing;

		if (pending) promptWhenSWInstalled(pending);

		registration.addEventListener('updatefound', () => {
			if (registration.installing) promptWhenSWInstalled(registration.installing);
		});
	}

	function triggerUpdate() {
		navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), {
			once: true
		});

		waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
	}

	onMount(() => {
		watchForUpdate();
	});
</script>

{#if waitingWorker}
	<div class="fixed inset-x-4 bottom-(--bottom-nav-clearance) z-50">
		<Item variant="outline" class="mx-auto max-w-120 bg-background shadow-lg">
			<ItemMedia variant="icon" class="translate-y-0! self-center!">
				<RefreshCwIcon class="text-primary" />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>Update available</ItemTitle>
				<ItemDescription>A new version of Wildex is ready.</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button onclick={triggerUpdate} size="sm">Update</Button>
			</ItemActions>
		</Item>
	</div>
{/if}
