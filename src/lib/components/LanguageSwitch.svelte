<script lang="ts">
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, setLocale, type Locale } from '$lib/paraglide/runtime';

	const otherLocale: Locale = getLocale() === 'fr' ? 'en' : 'fr';
</script>

<!-- Switching reloads the page, which works offline. -->
<button
	type="button"
	lang={otherLocale}
	aria-label={m.language_switch_label()}
	title={m.language_switch_label()}
	onclick={() => setLocale(otherLocale)}
	class="flex h-8 shrink-0 items-center gap-1.5 rounded-full border bg-card px-3 text-xs font-medium text-muted-foreground uppercase transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
>
	<GlobeIcon aria-hidden="true" class="size-3.5" />
	{otherLocale}
</button>
