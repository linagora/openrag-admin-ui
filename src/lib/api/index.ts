// Removes the trailing slash from the base URL if it exists
const normalizeUrl = (url: string): string => {
    return url.endsWith("/") ? url.slice(0, -1) : url;
};

// Retrieve the API base URL and credentials flag from dynamic config
let API_BASE_URL = "";
let INCLUDE_CREDENTIALS = false;

export function getApiBaseUrl() {
    return API_BASE_URL;
}

export function getIncludeCredentials() {
    return INCLUDE_CREDENTIALS;
}

export async function loadConfig() {
    const res = await fetch("/api/config");
    if (!res.ok) throw new Error("Failed to load config");
    const config = await res.json();
    API_BASE_URL = normalizeUrl(config.API_BASE_URL);
    INCLUDE_CREDENTIALS = !!config.INCLUDE_CREDENTIALS;
}

export async function login(authToken: string): Promise<boolean> {
    console.log("Trying to log in...");

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
    return true;
}

export * from "./indexer";
export * from "./dashboard";
