import { apiGet } from "$lib/api/api";
import type { IGitLabProject, IGitLabUser } from "$lib/types/gitLab";
import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";

/** Recheck the shared login cookie without touching the current ARC or mapping. */
export async function refreshGitLabSession(fetcher: typeof globalThis.fetch = fetch) {
    const user = await apiGet<IGitLabUser>(fetcher, "/api/gitlab/user");
    applicationStore.setGitLabUser(user);
    return user;
}

export async function getProjects() {
    const projects = await apiGet<IGitLabProject[]>(fetch, "/api/gitlab/projects?membership=true&per_page=50");
    return projects;
}

export async function getProject(id: number) {
    const project = await apiGet<IGitLabProject>(fetch, "/api/gitlab/projects/" + id);
    return project;
}

/**
 * Download the arc-ro-crate metadata json file for a specific project.
 * @param id
 * @returns ARC-RO-JSON
 */
export async function getArcJson(id: number) {
    return apiGet<ARC_RO_JSON>(fetch, `/api/arcs/${id}`);
}

export async function getCurrentUser() {
    try {
        const user = await apiGet<IGitLabUser>(fetch, `/api/gitlab/user`);
        return user;
    } catch (e) {
        return null;
    }
}
