<script lang="ts">
    import { oboFileStore } from "$lib/stores/oboFiles/OboFileStore.svelte";
    import type { OboSynonym, OboTerm } from "$lib/types/oboFiles";
    import { getContext } from "svelte";
    import Button from "../ui/button/button.svelte";
    import Input from "../ui/input/input.svelte";
    import Switch from "../ui/switch/switch.svelte";

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
            <Button variant={"destructive"} class="ml-auto" onclick={() => oboFileStore.removeTerm(index)}
                ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </Button>
        {/if}
    </div>

    <div class="py-4 flex flex-col gap-2">
        <h4 class="underline">References:</h4>
        <div class="grid grid-cols-4 gap-4">
            {#each term.xrefs as reference, index}
                <div class="flex flex-col justify-center p-2 border-gray-100 border rounded-sm hover:bg-gray-50">
                    <div class="flex gap-2 items-center">
                        <p class="py-2">{reference}</p>
                        {#if editMode}
                            <Button variant={"outline"} size={"icon"} onclick={() => oboFileStore.removeXref(term, index)} class="ml-auto"
                                ><svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="size-6"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
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
                                ><svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="size-6"
                                >
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
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
                        const syn: OboSynonym = {
                            synonymText: synonymInput,
                            scopeIdentifier: "EXACT",
                        };
                        oboFileStore.addSynonym(term, syn);
                    }}
                    ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Button>
                <Input placeholder={"synonym name..."} bind:value={synonymInput} class="max-w-80" />
            </div>
            <div class="flex gap-2 w-full">
                <Button onclick={() => oboFileStore.addXref(term, xrefInput)}
                    ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Button>
                <Input placeholder={"reference name..."} bind:value={xrefInput} class="max-w-80" />
            </div>
        </div>
    {/if}
</div>
