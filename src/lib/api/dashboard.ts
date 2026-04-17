// Base URL and auth helpers
import { getApiBaseUrl, authFetch } from "./index";


/**
 * Fetches all available actors
 */
export const fetchActors = async () => {
    console.log("Fetching actors...");
    const response = await authFetch(`${getApiBaseUrl()}/actors/`);

    if (!response.ok) {
        throw new Error(`Failed to fetch actors: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()).actors;
    console.log("Actors fetched : ", data);
    return data;
};


export const restartActor = async (actor_name: string) => {
    console.log(`Restarting actor ${actor_name}...`);
    const response = await authFetch(`${getApiBaseUrl()}/actors/${actor_name}/restart`, {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error(`Failed to restart actor ${actor_name}: ${response.status} ${response.statusText}`);
    }

    console.log(`Actor ${actor_name} restarted.`);
};
