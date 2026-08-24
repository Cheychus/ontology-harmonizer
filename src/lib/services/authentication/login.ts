import { GITLAB_CLIENT_ID, GITLAB_INSTANCE_BASE, REDIRECT_URI } from "$lib/config/settings";

function generateBase64UrlString(byteLength: number) {
    const base64UrlStr = crypto.getRandomValues(new Uint8Array(byteLength)).toBase64({ alphabet: "base64url", omitPadding: true });
    return base64UrlStr;
}

async function generatePkce() {
    const STATE = generateBase64UrlString(24);
    const CODE_VERIFIER = generateBase64UrlString(90);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(CODE_VERIFIER));
    const CODE_CHALLENGE = new Uint8Array(digest).toBase64({ alphabet: "base64url", omitPadding: true });

    return {
        STATE,
        CODE_VERIFIER,
        CODE_CHALLENGE
    }
}

export async function requestAuthorizationCodeUrl() {
    const pkceObj = await generatePkce();
    const params = new URLSearchParams({
        client_id: GITLAB_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        state: pkceObj.STATE,
        scope: "api",
        code_challenge: pkceObj.CODE_CHALLENGE,
        code_challenge_method: "S256",
    });

    sessionStorage.setItem("gitlab_state", pkceObj.STATE);
    sessionStorage.setItem("gitlab_code_verifier", pkceObj.CODE_VERIFIER);

    const url = GITLAB_INSTANCE_BASE + "/oauth/authorize?" + params.toString();

    return url;
}


