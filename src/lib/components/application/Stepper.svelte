<script lang="ts">
    import { page } from "$app/state";
    import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
    import { Button } from "../ui/button";

    let currentStep = $derived(applicationStore.getStepIndex(page.url.pathname));
</script>

<nav class="fixed top-0 w-full flex justify-center shadow py-6 overflow-hidden">
    <div class="relative w-full overflow-hidden">
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
    </div>
</nav>
