// Base URL and auth token
import { getApiBaseUrl } from "./index";
import { authToken } from "$lib/persisted.svelte";


/**
 * Fetches all available actors
 */
export const fetchActors = async () => {
    console.log("Fetching actors...");
    const response = await fetch(`${getApiBaseUrl()}/actors/`, {
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch actors: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()).actors;
    console.log("Actors fetched : ", data);
    return data;
};


export const restartActor = async (actor_name: string) => {
    console.log(`Restarting actor ${actor_name}...`);
    const response = await fetch(`${getApiBaseUrl()}/actors/${actor_name}/restart`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to restart actor ${actor_name}: ${response.status} ${response.statusText}`);
    }

    console.log(`Actor ${actor_name} restarted.`);
};
