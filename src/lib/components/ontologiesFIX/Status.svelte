<script lang="ts">
  import { arcStore } from "$lib/stores/ArcStore.svelte";
  import * as Table from "$lib/components/ui/table/index.js";
  import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte";
  import Button from "../ui/button/button.svelte";
  import { goto, preloadData } from "$app/navigation";
  import Collection from "../terminology/Collection.svelte";
  import { Settings, X } from "lucide-svelte";
  import { resolve } from "$app/paths";

  let statusLog: string[] = $state([]);
</script>

<div class="flex w-full flex-col gap-2 py-4">
  <h2 class="underline">Status Information</h2>
  <p>Filename: {arcStore.filename}</p>
  <!-- <Table.Root>
        <Table.Caption></Table.Caption>
        <Table.Header>
            <Table.Row>
                <Table.Head class="">Ontologies</Table.Head>
                <Table.Head>Defined</Table.Head>
                <Table.Head>Undefined</Table.Head>
                <Table.Head class="">Mappable</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            <Table.Row>
                <Table.Cell class="font-medium">{arcStore.ontologiesCount}</Table.Cell>
                <Table.Cell>{arcStore.definedOntologies.size}</Table.Cell>
                <Table.Cell>{arcStore.undefinedOntologies.size}</Table.Cell>
                <Table.Cell class="text-green-400">0</Table.Cell>
            </Table.Row>
        </Table.Body>
    </Table.Root> -->

  <div class="flex gap-4 items-center" role="status" onmouseenter={() => preloadData("./collections")}>
    <h3>Collection</h3>
    <Button
      variant={"outline"}
      size={"icon"}
      onclick={() => {
        goto(resolve("/collections"));
      }}><Settings class="w-6! h-6!" /></Button
    >

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
    <p>Define a collection to reduce the amounts of ontology search results</p>
  {/if}

  <h4 class="underline">Status Messages</h4>
  {#each statusLog as log}
    <p class="text-green-400">{log}</p>
  {/each}
</div>
