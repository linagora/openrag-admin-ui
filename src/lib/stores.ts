// Import types
import { writable, type Writable } from "svelte/store";
import { persisted, type Persisted } from "svelte-persisted-store";
import type { RagondinPartition, RagondinTaskInList } from "$lib/types";

// Data stores
export const partitions: Writable<RagondinPartition[]> = writable([]);
export const tasks: Writable<RagondinTaskInList[]> = writable([]);
export const activeTasks: Writable<RagondinTaskInList[]> = writable([]);

// Navigation stores
export const currentPartition: Writable<RagondinPartition | null> = writable(null);
export const currentFile: Writable<string | null> = writable(null);

// UI Stores
export const showUploadModal: Writable<boolean> = writable(false);
export const displayMode: Persisted<"grid" | "list"> = persisted("displayMode", "list");
