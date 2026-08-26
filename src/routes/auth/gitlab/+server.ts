import { redirect } from "@sveltejs/kit";
import { GITLAB_CLIENT_ID, REDIRECT_URI } from "$env/static/private";
import { GITLAB_INSTANCE_BASE } from "$lib/config/settings";

function generateBase64UrlString(byteLength: number) {
  const base64UrlStr = Buffer.from(crypto.getRandomValues(new Uint8Array(byteLength))).toString("base64url");
  return base64UrlStr;
}

async function generatePkce() {
  const STATE = generateBase64UrlString(24);
  const CODE_VERIFIER = generateBase64UrlString(90);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(CODE_VERIFIER));
  const CODE_CHALLENGE = Buffer.from(digest).toString("base64url");

  return {
    STATE,
    CODE_VERIFIER,
    CODE_CHALLENGE
  }
}


export const GET = async ({ cookies }) => {
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

  cookies.set("gitlab_state", pkceObj.STATE, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
  });

  cookies.set("gitlab_code_verifier", pkceObj.CODE_VERIFIER, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
  })


  throw redirect(302, `${GITLAB_INSTANCE_BASE + "/oauth/authorize?" + params.toString()}`);
};
