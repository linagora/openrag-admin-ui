// Import types
import { writable, type Writable } from "svelte/store";
import type { RagondinPartition } from "./types";

// Data stores
export const partitions: Writable<RagondinPartition[]> = writable([]);

// Navigation stores
export const currentPartition: Writable<RagondinPartition | null> = writable(null);
export const currentFile: Writable<string | null> = writable(null);

// UI Stores
export const showUploadModal: Writable<boolean> = writable(false);
