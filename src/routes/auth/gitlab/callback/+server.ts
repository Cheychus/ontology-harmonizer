import { GITLAB_CLIENT_ID, GITLAB_CLIENT_SECRET, REDIRECT_URI } from "$env/static/private";
import { GITLAB_INSTANCE_BASE } from "$lib/config/settings";
import { error, redirect } from "@sveltejs/kit";

export const GET = async ({ url, fetch, cookies }) => {
  const code = url.searchParams.get("code");
  if (!code) error(400, "GitLab did not return an authorization code");

  const response = await fetch(`${GITLAB_INSTANCE_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GITLAB_CLIENT_ID,
      client_secret: GITLAB_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI
    })
  });

  if (!response.ok) {
    error(502, "GitLab token exchange failed");
  }

  const { access_token } = await response.json();
  if (!access_token) error(502, "GitLab did not return an access token");

  cookies.set("gitlab_token", access_token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax"
  });

  throw redirect(302, "/select-arc");
};
