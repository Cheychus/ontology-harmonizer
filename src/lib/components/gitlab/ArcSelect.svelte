<script lang="ts">
  import { Button } from "../ui/button";
  import * as Item from "$lib/components/ui/item/index.js";
  import { goto } from "$app/navigation";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import type { IGitLabProject } from "$lib/types/gitLab";
  import { success } from "$lib/services/toasts/toastService";

  interface Props {
    project: IGitLabProject;
  }

  let { project }: Props = $props();
  let selecting = $state(false);

  async function selectArc() {
    if (selecting) return;
    selecting = true;
    try {
      const p = await arcStore.selectArc(Number(project.id));
      goto("/mapping");
      success("Selected " + p.name);
    } finally {
      selecting = false;
    }
  }
</script>

<Item.Root variant="outline">
  <Item.Content>
    <Item.Title>{project.name} - ID: {project.id}</Item.Title>
    <Item.Description>{project.description}</Item.Description>
  </Item.Content>
  <Item.Actions>
    <Button variant="outline" size="sm" disabled={selecting} onclick={selectArc}>{selecting ? "Downloading Arc..." : "Select"}</Button>
  </Item.Actions>
</Item.Root>
