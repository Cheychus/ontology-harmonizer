import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiGet, apiSend, ApiError } from "$lib/api/api";
import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
import { refreshGitLabSession } from "$lib/services/gitlab/gitlab";

vi.mock("$app/environment", () => ({ browser: true }));

beforeEach(() => {
    applicationStore.setGitLabUser({ username: "test-user" });
});

afterEach(() => {
    applicationStore.setGitLabUser(null);
    applicationStore.sessionExpired = false;
    arcStore.init({ "@context": [], "@graph": [] });
    arcStore.initialised = false;
    mappingStore.reset();
});

function failedFetch(status: number) {
    return vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status }));
}

describe("DataHUB session expiry", () => {
    it.each(["/api/gitlab/projects?membership=true", "/api/arcs/42"])(
        "clears the connection state on a 401 from %s",
        async (path) => {
            await expect(apiGet(failedFetch(401), path)).rejects.toMatchObject({ status: 401 });
            expect(applicationStore.isAuthenticated).toBe(false);
            expect(applicationStore.gitLabUser).toBeNull();
            expect(applicationStore.stepState.isLoggedIn).toBe(false);
            expect(applicationStore.sessionExpired).toBe(true);
        },
    );

    it("also handles expired sessions when writing to DataHUB", async () => {
        await expect(apiSend(failedFetch(401), {
            method: "POST", path: "/api/gitlab/projects/42/repository/commits", data: {},
        })).rejects.toThrow("Reconnect to continue");
        expect(applicationStore.sessionExpired).toBe(true);
    });

    it.each([403, 404, 500])("does not log out the user on status %s", async (status) => {
        await expect(apiGet(failedFetch(status), "/api/gitlab/projects/42")).rejects.toBeInstanceOf(ApiError);
        expect(applicationStore.isAuthenticated).toBe(true);
        expect(applicationStore.sessionExpired).toBe(false);
    });

    it("does not treat an unrelated API's 401 as a DataHUB logout", async () => {
        await expect(apiGet(failedFetch(401), "/api?target=matching")).rejects.toMatchObject({ status: 401 });
        expect(applicationStore.isAuthenticated).toBe(true);
    });

    it("preserves the loaded ARC and mappings, and clears the expiry notice after reconnecting", async () => {
        arcStore.init({ "@context": [], "@graph": [{ "@id": "test", "@type": "PropertyValue", name: "Organism" }] });
        mappingStore.createMappingSet();
        const current = mappingStore.current;
        const queue = [...mappingStore.queue];
        await expect(apiGet(failedFetch(401), "/api/gitlab/user")).rejects.toBeInstanceOf(ApiError);
        expect(arcStore.initialised).toBe(true);
        expect(arcStore.ontologyCandidates.has("Organism")).toBe(true);
        expect(mappingStore.hasMappingSet).toBe(true);
        applicationStore.setGitLabUser(null);
        expect(applicationStore.sessionExpired).toBe(true);
        const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ username: "reconnected" }));
        await refreshGitLabSession(fetcher);
        expect(applicationStore.isAuthenticated).toBe(true);
        expect(applicationStore.sessionExpired).toBe(false);
        expect(applicationStore.gitLabUser?.username).toBe("reconnected");
        expect(mappingStore.current).toBe(current);
        expect(mappingStore.queue).toEqual(queue);
        expect(arcStore.ontologyCandidates.has("Organism")).toBe(true);
        expect(fetcher).toHaveBeenCalledWith("/api/gitlab/user", expect.objectContaining({ method: "GET" }));
    });

    it("keeps the expired state when checking before the new-tab login is finished", async () => {
        applicationStore.expireGitLabSession();
        await expect(refreshGitLabSession(failedFetch(401))).rejects.toMatchObject({ status: 401 });
        expect(applicationStore.sessionExpired).toBe(true);
        expect(applicationStore.isAuthenticated).toBe(false);
    });

    it("does not show a session-expired notice for a visitor who has never signed in", async () => {
        applicationStore.setGitLabUser(null);
        await expect(apiGet(failedFetch(401), "/api/gitlab/user")).rejects.toBeInstanceOf(ApiError);
        expect(applicationStore.sessionExpired).toBe(false);
    });
});
