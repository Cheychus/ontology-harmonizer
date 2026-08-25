import { apiGet } from "$lib/api/api";

export class GitLabStore {

    downloadedArc = $state(null);

    /**
     * Download the arc-ro-crate metadata json file for a specific project. 
     * The data is stored in a ArcDatabaseObject and can be directly saved in the database. 
     * @param id 
     * @returns 
     */
    public async downloadProject(id: number) {
        try {
            return await apiGet<ARC_RO_JSON>(fetch, `/api/arcs/${id}`);
        } catch {
            return null;
        }
    }
}

export const gitLabStore = new GitLabStore();


