/**
 * This file contains all the global persisted states of the application.
 * @author Ulysse Bouchet for LINAGORA
 */

// Import utilities
import { persistedState } from "svelte-persisted-state";

// Import types
import type { ActiveUpload } from "$lib/types";

// Login states
export const authToken = persistedState<string | null>("AUTH_TOKEN", null);
export const authTokenCreatedAt = persistedState<number | null>("authTokenCreatedAt", null); // Timestamp of when the Auth Token was created, used to delete the token after a certain time

// UI states
export const navbarCollapsed = persistedState("navbarCollapsed", false); // Whether the navbar is collapsed or not
export const displayMode = persistedState("displayMode", "list"); // Display mode of the application, either "grid" or "list"

// Tasks states
export const activeUploads = persistedState("activeUploads", new Array<ActiveUpload>()); // Persisted list of all the uplaods currently in progress
