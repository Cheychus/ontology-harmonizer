import type { Actions } from "./$types";

export const actions: Actions = {
    logout: ({ cookies }) => {
        cookies.delete("gitlab_token", { path: "/" });
        cookies.delete("gitlab_state", { path: "/" });
        cookies.delete("gitlab_code_verifier", { path: "/" });
        return { success: true };
    },
};
