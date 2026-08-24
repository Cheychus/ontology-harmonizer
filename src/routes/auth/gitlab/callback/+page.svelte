<script lang="ts">
    import { goto } from "$app/navigation";
    import { GITLAB_CLIENT_ID, GITLAB_INSTANCE_BASE, REDIRECT_URI } from "$lib/config/settings";
    import { onMount } from "svelte";

    let error = $state<string | null>(null);
    onMount(async () => {
        try {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const returnedState = params.get("state");

            const expectedState = sessionStorage.getItem("gitlab_state");
            const codeVerifier = sessionStorage.getItem("gitlab_code_verifier");

            if (!code || !returnedState) {
                throw new Error("GitLab did not return an authorization code.");
            }
            if (!expectedState || returnedState !== expectedState) {
                throw new Error("Invalid OAuth state.");
            }
            if (!codeVerifier) {
                throw new Error("Missing PKCE code verifier");
            }

            const response = await fetch(`${GITLAB_INSTANCE_BASE}/oauth/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: GITLAB_CLIENT_ID,
                    code,
                    grant_type: "authorization_code",
                    redirect_uri: REDIRECT_URI,
                    code_verifier: codeVerifier,
                }),
            });
            if (!response.ok) {
                throw new Error(`GitLab token exchange failed: ${response.status}`);
            }

            const token = await response.json();
            localStorage.setItem("gitlab_access_token", token.access_token);

            if (token.refresh_token) {
                localStorage.setItem("gitlab_refresh_token", token.refresh_token);
            }

            sessionStorage.removeItem("gitlab_state");
            sessionStorage.removeItem("gitlab_code_verifier");

            await goto("/select-arc");
        } catch (e) {
            error = e instanceof Error ? e.message : "OAuth login failed.";
        }
    });
</script>

{#if error}
    <p class="text-red-500">{error}</p>
{:else}
    <p>Completing GitLab login…</p>
{/if}
