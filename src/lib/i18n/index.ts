import { addMessages, init, getLocaleFromNavigator } from "svelte-i18n";

import en from "./en.json";
import fr from "./fr.json";

const AVAILABLE_LOCALES = ["en", "fr"];

// Load locale dictionaries synchronously to avoid SSR hydration mismatch
addMessages("en", en);
addMessages("fr", fr);

/**
 * Match a BCP-47 language tag against available locales by prefix.
 * e.g. "fr-FR" -> "fr", "en-US" -> "en", "de" -> null
 */
function matchLocale(tag: string | null | undefined): string | null {
	if (!tag) return null;

	// Exact match first
	if (AVAILABLE_LOCALES.includes(tag)) return tag;

	// Prefix match: "fr-FR" -> "fr"
	const prefix = tag.split("-")[0].toLowerCase();
	if (AVAILABLE_LOCALES.includes(prefix)) return prefix;

	return null;
}

/**
 * Initialize svelte-i18n with the appropriate locale.
 *
 * Priority:
 * 1. Server-provided DEFAULT_LANGUAGE (from env var)
 * 2. Browser language (navigator.language)
 * 3. Fallback to "en"
 */
export function initI18n(serverDefault: string | null) {
	let locale: string | null = null;

	// Try server-provided default
	if (serverDefault) {
		locale = matchLocale(serverDefault);
		if (!locale) {
			console.warn(
				`[i18n] DEFAULT_LANGUAGE="${serverDefault}" does not match any available locale (${AVAILABLE_LOCALES.join(", ")}). Falling back to browser detection.`
			);
		}
	}

	// Try browser language
	if (!locale) {
		const browserLang = getLocaleFromNavigator();
		locale = matchLocale(browserLang);
	}

	// Ultimate fallback
	if (!locale) {
		locale = "en";
	}

	init({
		fallbackLocale: "en",
		initialLocale: locale,
	});
}
