import { createMergeRequest, updateProject } from "$lib/api/gitlab";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { ARC, Contract } from "@nfdi4plants/arctrl";
import { Xlsx } from "@fslab/fsspreadsheet";
import type { IGitLabProject, IGitlabResponse } from "$lib/types/gitLab";
import path from "node:path";
import { downloadJson } from "./arcFile.service";

export async function pushToGitlab() {
  const project = arcStore.project;
  if (!project) throw new Error("No Gitlab project defined");

  const arcRoJson = JSON.stringify(arcStore.json);
  let arc: ARC = ARC.fromROCrateJsonString(arcRoJson);

  const contracts = arc.GetWriteContracts();
  const gitActions = await fullfillWriteContractsGIT(contracts);
  console.log(contracts, gitActions);
  const newBranch = "ontologyHarmonizer/" + Date.now();

  const res1 = (await updateProject(project, newBranch, gitActions)) as IGitlabResponse;
  const res2 = (await createMergeRequest(project, newBranch)) as IGitlabResponse;

  const commitUrl = res1.web_url;
  const mergeUrl = res2.web_url;

  return {
    commitUrl,
    mergeUrl,
  };
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

async function fullfillWriteContractsGIT(contracts: Contract[]): Promise<GitAction[]> {
  const actions: GitAction[] = [];
  console.log(contracts);
  for (const contract of contracts) {
    if (contract.Operation === "CREATE" || (contract.Operation === "UPDATE" && contract.DTO !== undefined)) {
      // Only Assay, Study and Investigation are relevant for ontologies
      if (contract.DTOType === "ISA_Assay" || contract.DTOType === "ISA_Study" || contract.DTOType === "ISA_Investigation") {
        let xlsxBytes = await Xlsx.toBytes(contract.DTO);
        let base64String = btoa(String.fromCharCode.apply(null, xlsxBytes));
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
