import { describe, expect, it, vi } from "vitest";
import { GET } from "../src/routes/auth/gitlab/callback/+server";

vi.mock("$env/static/private", () => ({
    GITLAB_CLIENT_ID: "test-client",
    GITLAB_CLIENT_SECRET: "test-secret",
    REDIRECT_URI: "https://example.org/auth/gitlab/callback",
}));

describe("DataHUB login callback", () => {
    it.each([
        [true, "/auth/gitlab/reconnected"],
        [false, "/select-arc"],
    ] as const)("returns to the appropriate page (reconnecting: %s)", async (reconnecting, location) => {
        const values: Record<string, string | undefined> = {
            gitlab_state: "test-state",
            gitlab_code_verifier: "test-verifier",
            gitlab_reconnect: reconnecting ? "true" : undefined,
        };
        const cookies = {
            get: vi.fn((name: string) => values[name]),
            getAll: vi.fn(() => []),
            set: vi.fn(),
            delete: vi.fn(),
            serialize: vi.fn(() => ""),
        };
        const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ access_token: "test-token" }));

        const event: Pick<Parameters<typeof GET>[0], "url" | "cookies" | "fetch"> = {
            url: new URL("https://example.org/auth/gitlab/callback?code=test-code&state=test-state"),
            cookies, fetch: fetcher,
        };
        // The callback only reads the three RequestEvent fields supplied above.
        await expect(GET(event as unknown as Parameters<typeof GET>[0])).rejects.toMatchObject({ status: 302, location });

        expect(cookies.set).toHaveBeenCalledWith("gitlab_token", "test-token", expect.objectContaining({ httpOnly: true }));
        expect(cookies.delete).toHaveBeenCalledWith("gitlab_reconnect", { path: "/" });
    });
});
