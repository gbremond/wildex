<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';

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
	<Button onclick={triggerUpdate}>Update to the latest version</Button>
{/if}
