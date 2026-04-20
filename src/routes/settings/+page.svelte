<script lang="ts">
    import { Checkbox } from "$lib/components/ui/checkbox";
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { settingsStore } from "$lib/stores/settings/SettingsStore.svelte";
    import * as Select from "$lib/components/ui/select/index.js";
    import { Circle, CircleAlert, CircleCheck, X } from "lucide-svelte";
    import { apiGet } from "$lib/api/api";
    import Button from "$lib/components/ui/button/button.svelte";
    import { failure, success } from "$lib/services/toasts/toastService";
    import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
    import Collection from "$lib/components/terminology/Collection.svelte";

    const matchingMethod = [
        { value: "terminology", label: "API" },
        { value: "pythonService", label: "Matching Service" },
    ];

    let matchingMethodValue = $derived(settingsStore.matchingMethod);

    const triggerContent = $derived(matchingMethod.find((f) => f.value === matchingMethodValue)?.label ?? "Select a method");

    $effect(() => {
        if (settingsStore.matchingMethod === "pythonService" && !settingsStore.enablePythonMatchingService) {
            settingsStore.matchingMethod = "terminology"; // to prevent automatic matching service searchs when service is not available
        }
    });
</script>

{#if !settingsStore.loaded}
    <p class="w-full">loading...</p>
{:else}
    <section class="w-full flex flex-col gap-4">
        <h2>Settings</h2>
        <div class="w-full h-px border border-b"></div>

        <div class="flex flex-col w-full gap-2">
            <Label>Matching Service</Label>
            <div class="flex items-center gap-2">
                <Checkbox class="w-5 h-5" bind:checked={settingsStore.enablePythonMatchingService} />
                <p>Enable the python matching service</p>
            </div>
        </div>

        <div class="flex flex-col w-full gap-2">
            <Label>Matching Service URL</Label>
            <div class="flex flex-col gap-2">
                <p class="">
                    Provide an URL for the <a target="_blank" href="https://github.com/Cheychus/python-matching">python matching service</a>
                </p>
                <div class="flex items-center gap-2">
                    <Input
                        class="max-w-90"
                        id="matching-service"
                        placeholder="matching service url"
                        bind:value={settingsStore.pythonMatchingServiceUrl}
                    />
                    <Button
                        variant="outline"
                        onclick={async () => {
                            if (await settingsStore.checkService()) {
                                success("Matching service available");
                            } else {
                                failure("Matching service unavailable");
                            }
                        }}>Check</Button
                    >
                    {#if settingsStore.matchingServiceAvailable}
                        <CircleCheck class="text-green-400" />
                    {:else if settingsStore.matchingServiceAvailable !== null}
                        <CircleAlert class="text-red-400" />
                    {/if}
                </div>
            </div>
        </div>

        <div class="w-full h-px border border-b"></div>
        <div class="flex flex-col w-full gap-2">
            <Label>Automatic Matching</Label>
            <div class="flex items-center gap-2">
                <Checkbox class="w-5 h-5" bind:checked={settingsStore.automaticMatching} />
                <p>Enable automatic matching, to automatically search for ontology values</p>
            </div>
        </div>
        <div class="flex flex-col w-full gap-2">
            <Label>Automatic Matching Method</Label>
            <div class="flex items-center gap-2">
                <Select.Root type="single" name="matchingMethod" bind:value={settingsStore.matchingMethod}>
                    <Select.Trigger class="w-45">
                        {triggerContent}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            <Select.Label>Matching Method</Select.Label>
                            {#each matchingMethod as method (method.value)}
                                <Select.Item
                                    value={method.value}
                                    label={method.label}
                                    disabled={method.value === "pythonService" && !settingsStore.enablePythonMatchingService}
                                >
                                    {method.label}
                                </Select.Item>
                            {/each}
                        </Select.Group>
                    </Select.Content>
                </Select.Root>
            </div>
        </div>
        <div class="w-full h-px border border-b"></div>

        <div class="flex flex-col w-full gap-2">
            <Label>Collection</Label>
            <div class="flex flex-col gap-2">
                <p>Choose a collection to filter the ontology search for relevant ontologies</p>
                <Button class="w-64" variant="outline" href="/collections">Select Collection</Button>
            </div>
            <div class="flex">
                <Label>Current collection</Label>
                {#if terminologyStore.selectedCollection}
                    <Button
                        class="ml-auto"
                        size="icon-sm"
                        variant={"outline"}
                        onclick={() => {
                            terminologyStore.removeSelection();
                        }}
                        ><X />
                    </Button>
                {/if}
            </div>

            {#if terminologyStore.selectedCollection}
                <Collection collection={terminologyStore.selectedCollection} selectButton={false} />
            {:else}
                <p>No collection selected</p>
            {/if}
        </div>
    </section>
{/if}
