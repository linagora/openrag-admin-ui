import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		// Mount the app at a subpath when deployed behind a single vhost that
		// also serves the OpenRag backend. Set BASE_PATH at build time (e.g.
		// `BASE_PATH=/indexerui npm run build`). Must start with `/` and have
		// no trailing slash. Leave empty (default) for root-level deployment.
		paths: {
			base: process.env.BASE_PATH ?? ''
		}
	}
};

export default config;
