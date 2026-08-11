<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils';
	import { isTabActive } from './bottom-nav';
	import SearchIcon from '@lucide/svelte/icons/search';
	import BinocularsIcon from '@lucide/svelte/icons/binoculars';
	import Gamepad2Icon from '@lucide/svelte/icons/gamepad-2';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let isHomeActive = $derived(isTabActive(page.route.id, 'home'));
	let isObservationsActive = $derived(isTabActive(page.route.id, 'observations'));
	let isGamesActive = $derived(isTabActive(page.route.id, 'games'));
	let isDownloadsActive = $derived(isTabActive(page.route.id, 'downloads'));

	function tabClass(isActive: boolean) {
		return cn(
			'relative flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-3 text-[10px]',
			'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
			isActive ? 'text-primary' : 'text-muted-foreground'
		);
	}
</script>

{#snippet activeIndicator()}
	<span
		aria-hidden="true"
		class="absolute top-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary"
	></span>
{/snippet}

<nav aria-label="Main" class="fixed inset-x-0 bottom-0 z-50">
	<div
		class="relative mx-auto max-w-[480px] rounded-t-3xl border border-b-0 bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-4px_rgb(0_0_0/0.15)]"
	>
		<!-- The empty middle column is the gutter the raised button sits in. -->
		<ul class="grid grid-cols-[1fr_1fr_4rem_1fr_1fr]">
			<li class="min-w-0">
				<a
					href={resolve('/')}
					aria-current={isHomeActive ? 'page' : undefined}
					class={tabClass(isHomeActive)}
				>
					{#if isHomeActive}
						{@render activeIndicator()}
					{/if}
					<SearchIcon aria-hidden="true" focusable="false" class="size-5" />
					<span class="w-full truncate text-center">Home</span>
				</a>
			</li>

			<li class="min-w-0">
				<a
					href={resolve('/observations')}
					aria-current={isObservationsActive ? 'page' : undefined}
					class={tabClass(isObservationsActive)}
				>
					{#if isObservationsActive}
						{@render activeIndicator()}
					{/if}
					<BinocularsIcon aria-hidden="true" focusable="false" class="size-5" />
					<span class="w-full truncate text-center">Observations</span>
				</a>
			</li>

			<li class="col-start-4 min-w-0">
				<a
					href={resolve('/games')}
					aria-current={isGamesActive ? 'page' : undefined}
					class={tabClass(isGamesActive)}
				>
					{#if isGamesActive}
						{@render activeIndicator()}
					{/if}
					<Gamepad2Icon aria-hidden="true" focusable="false" class="size-5" />
					<span class="w-full truncate text-center">Games</span>
				</a>
			</li>

			<li class="col-start-5 min-w-0">
				<a
					href={resolve('/downloads')}
					aria-current={isDownloadsActive ? 'page' : undefined}
					class={tabClass(isDownloadsActive)}
				>
					{#if isDownloadsActive}
						{@render activeIndicator()}
					{/if}
					<DownloadIcon aria-hidden="true" focusable="false" class="size-5" />
					<span class="w-full truncate text-center">Downloads</span>
				</a>
			</li>
		</ul>

		<button
			type="button"
			onclick={() => {}}
			class="absolute -top-7 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
		>
			<PlusIcon aria-hidden="true" focusable="false" class="size-6" />
			<span class="sr-only">Add</span>
		</button>
	</div>
</nav>
