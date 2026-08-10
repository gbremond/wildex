<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils';
	import { isTabActive } from './bottom-nav';
	import SearchIcon from '@lucide/svelte/icons/search';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import PlusIcon from '@lucide/svelte/icons/plus';

	let isHomeActive = $derived(isTabActive(page.route.id, 'home'));
	let isDownloadsActive = $derived(isTabActive(page.route.id, 'downloads'));

	function tabClass(isActive: boolean) {
		return cn(
			'relative flex flex-col items-center gap-1 rounded-md py-3 text-xs',
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
		<ul class="grid grid-cols-2">
			<li>
				<a
					href={resolve('/')}
					aria-current={isHomeActive ? 'page' : undefined}
					class={tabClass(isHomeActive)}
				>
					{#if isHomeActive}
						{@render activeIndicator()}
					{/if}
					<SearchIcon aria-hidden="true" focusable="false" class="size-5" />
					Home
				</a>
			</li>

			<li>
				<a
					href={resolve('/downloads')}
					aria-current={isDownloadsActive ? 'page' : undefined}
					class={tabClass(isDownloadsActive)}
				>
					{#if isDownloadsActive}
						{@render activeIndicator()}
					{/if}
					<DownloadIcon aria-hidden="true" focusable="false" class="size-5" />
					Downloads
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
