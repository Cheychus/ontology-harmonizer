<script lang="ts">
    import { curieToIri } from "$lib/services/oboFiles/oboFile.service";
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
    import type { OboTerm } from "$lib/types/oboFiles";
    import Button from "../ui/button/button.svelte";
    import Input from "../ui/input/input.svelte";
    import Switch from "../ui/switch/switch.svelte";
    import { Plus, X } from "lucide-svelte";

    interface Props {
        term: OboTerm;
        index: number;
    }

    let { term, index }: Props = $props();

    let synonymInput: string = $state("");
    let xrefInput: string = $state("");
    let editMode = $state(false);
</script>

<div class="flex flex-col">
    <div class="flex items-center">
        <h4 class="py-2">[{term.id}] - {term.name}</h4>
        <div class="px-8 flex items-center gap-2" class:text-blue-500={editMode}>
            <Switch bind:checked={editMode} />
            Edit Mode
        </div>

        {#if editMode}
            <Button variant={"destructive"} class="ml-auto" onclick={() => oboFileStore.removeTerm(index)}><X /></Button>
        {/if}
    </div>

    <div class="py-4 flex flex-col gap-2">
        <h4 class="underline">References:</h4>
        <div class="grid grid-cols-4 gap-4">
            {#each term.xrefs as reference, index}
                <div class="flex flex-col justify-center p-2 border-gray-100 border rounded-sm hover:bg-gray-50">
                    <div class="flex gap-2 items-center">
                        <a
                            class="py-2 flex items-center gap-2"
                            href={`http://purl.obolibrary.org/obo/${curieToIri(reference)}`}
                            aria-label="Link to ontology"
                            target="_blank"
                            >{reference}
                        </a>

                        {#if editMode}
                            <Button variant={"outline"} size={"icon"} onclick={() => oboFileStore.removeXref(term, index)} class="ml-auto"
                                ><X />
                            </Button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
    <div class="py-4 flex flex-col gap-2">
        <h4 class="underline">Synonyms:</h4>
        <div class="grid grid-cols-4 gap-4">
            {#each term.synonyms as synonym, index}
                <div class="flex flex-col justify-center p-2 border-gray-100 border rounded-sm hover:bg-gray-50">
                    <div class="flex gap-2 items-center">
                        <p class="py-2">{synonym.synonymText}</p>
                        {#if editMode}
                            <Button onclick={() => oboFileStore.removeSynonym(term, index)} variant={"outline"} size={"icon"} class="ml-auto"
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
                        oboFileStore.addSynonym(term, synonymInput);
                    }}
                    ><Plus />
                </Button>
                <Input placeholder={"synonym name..."} bind:value={synonymInput} class="max-w-80" />
            </div>
            <div class="flex gap-2 w-full">
                <Button onclick={() => oboFileStore.addXref(term, xrefInput)}><Plus /></Button>
                <Input placeholder={"reference name..."} bind:value={xrefInput} class="max-w-80" />
            </div>
        </div>
    {/if}
</div>
