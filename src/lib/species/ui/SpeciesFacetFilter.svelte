<script lang="ts" generics="Value extends string">
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import PlusCircleIcon from '@lucide/svelte/icons/circle-plus';
	import type { Snippet } from 'svelte';
	import type { FacetOption } from './facet-options';

	let {
		label,
		options,
		selected = $bindable(),
		onchange,
		optionBadge
	}: {
		label: string;
		options: FacetOption<Value>[];
		selected: Value[];
		onchange: () => void;
		optionBadge?: Snippet<[FacetOption<Value>]>;
	} = $props();

	const MAX_LISTED_OPTIONS = 2;

	const selectedOptions = $derived(options.filter((option) => isSelected(option.value)));

	function isSelected(value: Value): boolean {
		return selected.includes(value);
	}

	function toggle(value: Value) {
		selected = isSelected(value) ? selected.filter((kept) => kept !== value) : [...selected, value];

		onchange();
	}

	function clear() {
		selected = [];
		onchange();
	}
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				size="sm"
				class={selected.length === 0 ? 'border-dashed text-muted-foreground' : ''}
			>
				<PlusCircleIcon />
				{label}
				{#if selected.length > 0}
					<Separator orientation="vertical" class="mx-0.5 h-4" />
					{#if selectedOptions.length > MAX_LISTED_OPTIONS}
						<Badge variant="secondary">{selectedOptions.length} selected</Badge>
					{:else}
						{#each selectedOptions as option (option.value)}
							{#if optionBadge}
								{@render optionBadge(option)}
							{:else}
								<Badge variant="secondary" class="max-w-32">{option.label}</Badge>
							{/if}
						{/each}
					{/if}
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content class="w-60 p-0" align="start">
		<Command.Root>
			<Command.Input placeholder="Search {label}…" />
			<Command.List class="max-h-64">
				<Command.Empty>Nothing matches.</Command.Empty>
				<Command.Group>
					{#each options as option (option.value)}
						<Command.Item
							value={option.label}
							data-checked={isSelected(option.value)}
							aria-checked={isSelected(option.value)}
							onSelect={() => toggle(option.value)}
						>
							{#if optionBadge}
								{@render optionBadge(option)}
							{:else}
								<span class="truncate">{option.label}</span>
							{/if}
						</Command.Item>
					{/each}
				</Command.Group>
				{#if selected.length > 0}
					<Command.Separator class="my-1" />
					<Command.Group>
						<Command.Item onSelect={clear} class="justify-center text-muted-foreground">
							Clear {label}
						</Command.Item>
					</Command.Group>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
