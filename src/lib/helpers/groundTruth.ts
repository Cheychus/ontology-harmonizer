import { iriToCurie } from "$lib/services/oboFiles/oboFile.service";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";

export function extractGroundTruth() {
  const truth: any = {};
  arcStore.ontologyCandidates.entries().forEach((o) => {
    const value = o[0];
    const onto = o[1].value;
    let id = onto.split("/").pop() ?? "";
    truth[value] = iriToCurie(id)
  });
  return JSON.stringify(truth);
}
