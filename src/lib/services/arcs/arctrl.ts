import { createMergeRequest, updateProject } from "$lib/api/gitlab";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { ARC, Contract } from "@nfdi4plants/arctrl";
import { Xlsx } from "@fslab/fsspreadsheet";
import type { IGitLabProject, IGitlabResponse } from "$lib/types/gitLab";
import path from "node:path";
import { downloadJson } from "./arcFile.service";
import { toast } from "@zerodevx/svelte-toast";
import { failure } from "../toasts/toastService";

export async function pushToGitlab() {
  const id = toast.push("Commit changes to GitLab...", {
    duration: 300, // Each progress change takes 300ms
    initial: 0,
    next: 0,
    dismissable: false,
  });
  const project = arcStore.project;
  if (!project) throw new Error("No Gitlab project defined");
  try {
    toast.set(id, { next: 0.1 })

    const arcRoJson = JSON.stringify(arcStore.json);
    let arc: ARC = ARC.fromROCrateJsonString(arcRoJson);
    toast.set(id, { next: 0.2 })

    const contracts = arc.GetWriteContracts();
    const gitActions = await fullfillWriteContractsGIT(contracts);
    toast.set(id, { next: 0.3 })
    const newBranch = "ontologyHarmonizer/" + Date.now();

    const res1 = (await updateProject(project, newBranch, gitActions)) as IGitlabResponse;
    toast.set(id, { next: 0.6 })
    const res2 = (await createMergeRequest(project, newBranch)) as IGitlabResponse;
    toast.set(id, { next: 1 })

    const commitUrl = res1.web_url;
    const mergeUrl = res2.web_url;

    return {
      commitUrl,
      mergeUrl,
    };
  } catch (e) {
    console.error(e)
    failure("" + e)
  } finally {
    toast.pop(id);
  }

}

export type GitPayload = {
  branch: string;
  commit_message: string;
  actions: GitAction[];
};

export type GitAction = {
  action: "create" | "update";
  file_path: string;
  content: any;
  encoding: "text" | "base64";
};

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

async function fullfillWriteContractsGIT(contracts: Contract[]): Promise<GitAction[]> {
  const actions: GitAction[] = [];
  for (const contract of contracts) {
    if (contract.Operation === "CREATE" || (contract.Operation === "UPDATE" && contract.DTO !== undefined)) {
      // Only Assay, Study and Investigation are relevant for ontologies
      if (contract.DTOType === "ISA_Assay" || contract.DTOType === "ISA_Study" || contract.DTOType === "ISA_Investigation") {
        let xlsxBytes = await Xlsx.toBytes(contract.DTO);
        const base64String = bytesToBase64(xlsxBytes);
        actions.push({
          action: "update",
          file_path: contract.Path,
          content: base64String,
          encoding: "base64",
        });
      }
    }
  }

  return actions;
}
