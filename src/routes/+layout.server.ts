import { env } from "$env/dynamic/private";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => {
	return {
		defaultLanguage: env.DEFAULT_LANGUAGE || null,
	};
};
