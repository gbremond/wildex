<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale, setLocale, type Locale } from '$lib/paraglide/runtime';

	const FLAGS: Record<Locale, string> = { fr: '🇫🇷', en: '🇬🇧' };

	const otherLocale: Locale = getLocale() === 'fr' ? 'en' : 'fr';
</script>

<!-- Flag and label are in the language it switches to; switching reloads, which works offline. -->
<button
	type="button"
	aria-label={m.language_switch_label()}
	title={m.language_switch_label()}
	onclick={() => setLocale(otherLocale)}
	class="flex size-9 items-center justify-center rounded-full text-xl leading-none transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
>
	{FLAGS[otherLocale]}
</button>
