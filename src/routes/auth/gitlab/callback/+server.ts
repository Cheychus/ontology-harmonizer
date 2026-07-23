import { GITLAB_CLIENT_ID, GITLAB_CLIENT_SECRET, REDIRECT_URI } from "$env/static/private";
import { GITLAB_INSTANCE_BASE } from "$lib/config/settings.js";
import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte.js";
import { redirect } from "@sveltejs/kit";

export const GET = async ({ url, fetch, cookies }) => {
  const code = url.searchParams.get("code");

  const res = await fetch(`${GITLAB_INSTANCE_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: GITLAB_CLIENT_ID,
      client_secret: GITLAB_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await res.json();

  const accessToken = data.access_token;

  cookies.set("gitlab_token", accessToken, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  applicationStore.isAuthenticated = true;
  throw redirect(302, "/select-arc");
};
