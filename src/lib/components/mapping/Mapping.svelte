<script lang="ts">
    import { curieToIri } from "$lib/services/oboFiles/oboFile.service";
    import { mappingStore, type IMapping } from "$lib/stores/mapping/MappingStore.svelte";
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
    import type { OboTerm } from "$lib/types/oboFiles";
    import Button from "../ui/button/button.svelte";
    import Input from "../ui/input/input.svelte";
    import Switch from "../ui/switch/switch.svelte";
    import { Plus, X } from "lucide-svelte";

    interface Props {
        mapping: IMapping;
        index: number;
    }

    let { mapping = $bindable(), index }: Props = $props();

    let synonymInput: string = $state("");
    let editMode = $state(false);
</script>

<div class="flex flex-col">
    <div class="flex items-center">
        <h4 class="underline py-2">{mapping.name}</h4>
        <div class="px-8 flex items-center gap-2" class:text-blue-500={editMode}>
            <Switch bind:checked={editMode} />
            Edit Mode
        </div>

        {#if editMode}
            <Button variant={"destructive"} class="ml-auto" onclick={() => mappingStore.removeMapping(index)}><X /></Button>
        {/if}
    </div>

    <div class="py-4 flex flex-col gap-2">
        <div class="flex gap-2 items-center">
            <h4>IRI:</h4>
            {#if editMode}
                <Input class="" bind:value={mapping.iri} />
            {:else}
                <p>{mapping.iri}</p>
            {/if}
        </div>
        <div class="flex gap-2 items-center">
            <h4>Curie:</h4>
            {#if editMode}
                <Input class="max-w-64" bind:value={mapping.shortForm} />
            {:else}
                <p>{mapping.shortForm}</p>
            {/if}
        </div>
    </div>
    <div class=" flex flex-col gap-2">
        <h4 class="">Synonyms:</h4>
        <div class="grid grid-cols-4 gap-4">
            {#each mapping.synonyms as synonym, index}
                <div class="flex flex-col justify-center p-2 border-gray-100 border rounded-sm hover:bg-gray-50">
                    <div class="flex gap-2 items-center">
                        <p class="py-2">{synonym}</p>
                        {#if editMode}
                            <Button onclick={() => mappingStore.removeSynonym(mapping, index)} variant={"outline"} size={"icon"} class="ml-auto"
                                ><X />
                            </Button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    {#if editMode}
        <div class="flex py-4 gap-4">
            <div class="flex gap-2 w-full">
                <Button
                    onclick={() => {
                        mappingStore.addSynonym(mapping, synonymInput);
                    }}
                    ><Plus />
                </Button>
                <Input placeholder={"synonym name..."} bind:value={synonymInput} class="max-w-80" />
            </div>
        </div>
    {/if}
</div>
