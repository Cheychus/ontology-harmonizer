<script lang="ts">
    import { page } from "$app/state";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { Play, Settings } from "lucide-svelte";
    import { Button } from "../ui/button";
    import { startDemo } from "$lib/services/demo/demo";
    import { exportMapping } from "$lib/services/sssom/serializeSssomTsv";
    import { downloadJson } from "$lib/services/arcs/arcFile.service";
    import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";

    let currentStep = $derived(applicationStore.getStepIndex(page.url.pathname));
</script>

<nav class="fixed top-0 z-50 w-full flex justify-center shadow bg-white py-4 overflow-hidden">
    <div class="relative w-full overflow-hidden flex justify-center">
        <div class="absolute left-4"><Button href="/settings" variant="ghost" size="icon"><Settings /></Button></div>
        <div class="flex justify-center gap-4">
            {#each applicationStore.steps as step, i}
                <Button
                    variant="link"
                    href={step.href}
                    onclick={() => (applicationStore.currentStep = i)}
                    class={i === currentStep ? "font-bold" : "opacity-50"}
                >
                    {i + 1}. {step.label}
                </Button>
            {/each}
        </div>

        <div class="absolute right-4 flex gap-2">
            <Button variant="outline" onclick={() => downloadJson(mappingStore.mappingSet, "mapping.json")}>Download JSON</Button>
            <Button onclick={exportMapping}>Download TSV</Button>
        </div>
    </div>
</nav>
