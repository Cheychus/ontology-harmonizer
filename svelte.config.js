import vercel from '@sveltejs/adapter-vercel';
// import adapter from '@sveltejs/adapter-node';
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: "index.html"
		}),
		paths: {
			base: process.env.NODE_ENV === "production"
				? "https://cheychus.github.io/ontology-harmonizer/"
				: ""
		}
	}
};


export default config;
