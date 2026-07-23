// See https://svelte.dev/docs/kit/types#app.d.ts

import type { IGitLabUser } from "$lib/types/gitLab";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: IGitLabUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
