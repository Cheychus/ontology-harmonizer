import vercel from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: vercel({ runtime: "nodejs24.x" }),
		paths: { base: "" }
	}
};


export default config;
