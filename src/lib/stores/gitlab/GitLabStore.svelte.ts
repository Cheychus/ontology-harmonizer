import type { GitLabProject } from "$lib/types/gitLab";
import { arcStore } from "../arcs/ArcStore.svelte";

// const BASE = "https://git.nfdi4plants.org/api/v4";
const BASE = "https://datahub-dev.ipk-gatersleben.de/api/v4";
const PROJECTS_BASE = BASE + "/projects";
const PATH_TO_ARC_JSON = "/packages/generic/isa_arc_json/0.0.1/arc-ro-crate-metadata.json";

export class GitLabStore {
  downloadedArc = $state(null);

  /**
   * Download the arc-ro-crate metadata json file for a specific project.
   * The data is stored in a ArcDatabaseObject and can be directly saved in the database.
   * @param id
   * @returns
   */
  public async getArcJson(id: number) {
    // get project data from projects

    const arcRoCrateURL = `${PROJECTS_BASE}/${id}${PATH_TO_ARC_JSON}`;

    const res = await fetch(`/api?target=${encodeURIComponent(arcRoCrateURL)}`);
    if (!res.ok) {
      console.error("Download failed", res.status);
      return null;
    }

    const json = await res.json();
    console.log(json, "downloaded Arc");

    return json;
  }

  public async getProject(id: number): Promise<GitLabProject | null> {
    const res: Response = await fetch(PROJECTS_BASE + "/" + id, {});
    console.log(res);

    if (!res.ok) {
      console.log(`Error while getting project with id: ${id}!`);
      return null;
    }

    const project = (await res.json()) as GitLabProject;

    return project;
  }
}

export const gitLabStore = new GitLabStore();
