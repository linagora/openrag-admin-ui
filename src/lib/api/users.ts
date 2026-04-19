// Base URL and auth helpers
import { authFetch, getApiBaseUrl } from "./index";

/**
 * Regenerates the API token of a user.
 *
 * The caller must be either the owner of the account (`user_id` matches the
 * authenticated user) or an admin. The previous token is invalidated
 * immediately and the new one is returned in cleartext — the backend only
 * stores its hash, so the value is shown exactly once.
 */
export const regenerateUserToken = async (user_id: number): Promise<string> => {
    console.log(`Regenerating API token for user ${user_id}...`);
    const response = await authFetch(
        `${getApiBaseUrl()}/users/${user_id}/regenerate_token`,
        { method: "POST" }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to regenerate token: ${response.status} ${response.statusText}`
        );
    }

    const data = await response.json();
    console.log("API token regenerated.");
    return data.token as string;
};
