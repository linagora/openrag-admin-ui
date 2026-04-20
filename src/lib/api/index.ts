import { base } from "$app/paths";
import type { UserInfo } from "$lib/types";

// Removes the trailing slash from the base URL if it exists
const normalizeUrl = (url: string): string => {
    return url.endsWith("/") ? url.slice(0, -1) : url;
};

// Retrieve the API base URL, credentials flag and auth mode from dynamic config
let API_BASE_URL = "";
let INCLUDE_CREDENTIALS = false;
let AUTH_MODE: "token" | "oidc" = "token";

export function getApiBaseUrl() {
    return API_BASE_URL;
}

export function getIncludeCredentials() {
    return INCLUDE_CREDENTIALS;
}

export function getAuthMode() {
    return AUTH_MODE;
}

export function isOidcMode() {
    return AUTH_MODE === "oidc";
}

export async function loadConfig() {
    // Prefix with SvelteKit's `base` (set via kit.paths.base / BASE_PATH env
    // at build) so the call resolves correctly when indexer-ui is mounted
    // under a subpath like /indexerui/.
    const res = await fetch(`${base}/api/config`);
    if (!res.ok) throw new Error("Failed to load config");
    const config = await res.json();
    API_BASE_URL = normalizeUrl(config.API_BASE_URL);
    INCLUDE_CREDENTIALS = !!config.INCLUDE_CREDENTIALS;
    AUTH_MODE = config.AUTH_MODE === "oidc" ? "oidc" : "token";
}

/**
 * Unified fetch wrapper that handles both auth modes.
 * - token mode: sets Authorization: Bearer <localStorage token>
 * - oidc mode: sends cookies via credentials: "include", handles 401/403 by redirecting to /auth/login
 */
export async function authFetch(input: string, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    const credentials: RequestCredentials =
        AUTH_MODE === "oidc" || INCLUDE_CREDENTIALS ? "include" : "omit";

    if (AUTH_MODE === "token") {
        // Import dynamically to avoid a cycle with persisted.svelte
        const { authToken } = await import("$lib/persisted.svelte");
        if (authToken.current) {
            headers.set("Authorization", `Bearer ${authToken.current}`);
        }
    }
    // In oidc mode we do NOT set Authorization; the cookie authenticates us.

    const response = await fetch(input, { ...init, headers, credentials });

    // oidc auto-redirect on unauth (401 only — 403 means authenticated but lacking
    // permission, so re-login would just loop back to the same forbidden page).
    if (AUTH_MODE === "oidc" && response.status === 401) {
        const next = encodeURIComponent(window.location.href);
        window.location.href = `${API_BASE_URL}/auth/login?next=${next}`;
        // Return a pending-forever response so callers don't see stale 401 data
        return new Promise(() => {});
    }

    return response;
}

export interface LoginResult {
    ok: boolean;
    // Present in OIDC mode when login succeeds: the /users/info payload
    // fetched during the auth check. Callers can reuse it to avoid a second
    // round-trip for the same data.
    userInfo?: UserInfo;
}

export async function login(authToken?: string): Promise<LoginResult> {
    console.log("Trying to log in...");

    if (AUTH_MODE === "oidc") {
        const response = await fetch(`${API_BASE_URL}/users/info`, {
            credentials: "include",
        });
        if (!response.ok) return { ok: false };
        console.log("Log in successful (oidc).");
        const userInfo = (await response.json()) as UserInfo;
        return { ok: true, userInfo };
    }

    // token mode: existing behaviour
    const response = await fetch(`${API_BASE_URL}/health_check`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Pass the AUTH_TOKEN as a Bearer token
        },
        credentials: INCLUDE_CREDENTIALS ? "include" : "omit", // Include or omit headers in the request
    });

    if (!response.ok) {
        throw new Error(`Failed to log in: ${response.status} ${response.statusText}`);
    }

    console.log("Log in successful.");
    return { ok: true };
}

export * from "./indexer";
export * from "./dashboard";
export * from "./users";
