// Import utilities
import { writable, type Writable } from "svelte/store";

// Import types
import type { RagondinPartition } from "./types";

export const partitions: Writable<RagondinPartition[]> = writable([]);

export const selectedPartition: Writable<RagondinPartition | null> = writable(null);

export const showUploadModal: Writable<boolean> = writable(false);