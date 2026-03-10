<script lang="ts">
  import { Button } from "../ui/button";
  import * as Item from "$lib/components/ui/item/index.js";
  import { gitLabStore } from "$lib/stores/gitlab/GitLabStore.svelte";
  import { goto } from "$app/navigation";
  import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
  import type { GitLabProject } from "$lib/types/gitLab";

  interface Props {
    project: GitLabProject;
  }

  let { project }: Props = $props();

  async function selectArc() {
    const arc = await gitLabStore.getArcJson(Number(project.id));
    gitLabStore.downloadedArc = arc;
    arcStore.init(arc);
    arcStore.filename = project.name;

    goto("/");
  }
</script>

<Item.Root variant="outline">
  <Item.Content>
    <Item.Title>{project.name} - {project.id}</Item.Title>
    <Item.Description>{project.description}</Item.Description>
  </Item.Content>
  <Item.Actions>
    <Button variant="outline" size="sm" onclick={async () => selectArc()}>Select</Button>
  </Item.Actions>
</Item.Root>
