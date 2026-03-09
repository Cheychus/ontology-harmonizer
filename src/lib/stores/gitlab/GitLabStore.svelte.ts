export class GitLabStore {

    downloadedArc = $state(null);

    /**
     * Download the arc-ro-crate metadata json file for a specific project. 
     * The data is stored in a ArcDatabaseObject and can be directly saved in the database. 
     * @param id 
     * @returns 
     */
    public async downloadProject(id: number) {
        // get project data from projects
        const arcRoCrateURL = `https://git.nfdi4plants.org/api/v4/projects/${id}/packages/generic/isa_arc_json/0.0.1/arc-ro-crate-metadata.json`;
        const project = await fetch("https://git.nfdi4plants.org/api/v4/projects/" + id);

        if (!project) {
            console.log(`Could not download project with id ${id}!`);
            return null;
        }

        const res = await fetch(`/api?target=${encodeURIComponent(arcRoCrateURL)}`);
        if (!res.ok) {
            console.error("Download failed", res.status);
            return null;
        }

        const json = await res.json();
        console.log(json, "downloaded Arc");

        return json;
    }
}

export const gitLabStore = new GitLabStore();


