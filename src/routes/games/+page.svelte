<script lang="ts">
    import {getSpeciesList, loadSpeciesInMemory} from '$lib/species/data/repository';
    import type {Species} from '$lib/species/model/model';
    import {onMount} from 'svelte';
    import {fly} from 'svelte/transition';
    import {resolve} from '$app/paths';
    import {speciesImageUrl} from '$lib/species/data/image';
    import {Button} from '$lib/components/ui/button';
    import {
        Item,
        ItemMedia,
        ItemContent,
        ItemTitle,
        ItemDescription,
        ItemActions
    } from '$lib/components/ui/item';
    import {cn} from '$lib/utils';
    import CheckIcon from '@lucide/svelte/icons/check';
    import XIcon from '@lucide/svelte/icons/x';

    let species = $state<Species[]>([]);
    let choices = $state<Species[]>([]);
    let answer = $state<Species | undefined>(undefined);
    let picked = $state<Species | undefined>(undefined);
    let score = $state(0);
    let attempts = $state(0);

    let imageUrl = $derived(answer && speciesImageUrl(answer.scientificName, 'medium'));
    let hasWon = $derived(picked?.id === answer?.id);

    onMount(async () => {
        await loadSpeciesInMemory();
        species = await getSpeciesList();
        startRound();
    });

    function startRound() {
        picked = undefined;
        choices = pickRandom(species, 4);
        answer = choices[Math.floor(Math.random() * choices.length)];
    }

    function submitAnswer(choice: Species) {
        picked = choice;
        attempts += 1;

        if (choice.id === answer?.id) score += 1;
    }

    function pickRandom(items: Species[], count: number) {
        const pool = [...items];
        const picks = Math.min(count, pool.length);

        for (let i = 0; i < picks; i++) {
            const pick = i + Math.floor(Math.random() * (pool.length - i));
            [pool[i], pool[pick]] = [pool[pick], pool[i]];
        }

        return pool.slice(0, picks);
    }

    function choiceClass(choice: Species) {
        if (!picked) return '';
        if (choice.id === answer?.id) return 'border-success bg-success/10 text-success';
        if (choice.id === picked.id) return 'border-destructive bg-destructive/10 text-destructive';

        return '';
    }
</script>

<div class="mx-auto max-w-120 p-4 pb-(--bottom-nav-clearance)">
    <h1 class="text-3xl">Games</h1>

    <p class="text-muted-foreground">Score : {score} / {attempts} attempts</p>

    {#if answer}
        <img
                src={imageUrl}
                alt="Bird to identify"
                class="my-4 aspect-[3/2] w-full rounded object-cover"
        />

        <div class="grid grid-cols-2 gap-4">
            {#each choices as choice (choice.id)}
                <Button
                        variant="outline"
                        disabled={picked !== undefined}
                        onclick={() => submitAnswer(choice)}
                        class={cn(
						'h-auto min-h-9 py-2 text-center whitespace-normal disabled:opacity-100',
						choiceClass(choice)
					)}
                >
                    {#if picked && choice.id === answer.id}
                        <CheckIcon data-icon="inline-start"/>
                    {:else if picked?.id === choice.id}
                        <XIcon data-icon="inline-start"/>
                    {/if}
                    {choice.frenchName}
                </Button>
            {/each}
        </div>

        {#if picked}
            <div role="status" transition:fly={{ y: 16, duration: 200 }}>
                <Item variant="outline" class="mt-4 bg-background shadow-lg">
                    <ItemMedia variant="icon" class="translate-y-0! self-center!">
                        {#if hasWon}
                            <CheckIcon class="text-success"/>
                        {:else}
                            <XIcon class="text-destructive"/>
                        {/if}
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>{hasWon ? 'Correct!' : 'Not this one'}</ItemTitle>
                        <ItemDescription>
                            {#if !hasWon}
                                It was
                            {:else}
                                See
                            {/if}
                            <a
                                    href={resolve('/species/[id]', { id: answer.id })}
                                    class="font-medium text-foreground underline underline-offset-4"
                            >
                                {answer.frenchName}
                            </a>
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                        <Button onclick={startRound} size="sm">Next</Button>
                    </ItemActions>
                </Item>
            </div>
        {/if}
    {:else}
        <p class="mt-4">No species on this device yet. Download the list first.</p>
    {/if}
</div>
