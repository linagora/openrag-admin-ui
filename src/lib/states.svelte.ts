/**
 * This file contains all the global runtime states of the application.
 * @author Ulysse Bouchet for LINAGORA
 */

// Import types
import type { RAGPartition, RAGTaskInList } from "$lib/types";

// UI States
export const ui: { showUploadModal: boolean; showLoginPage: boolean } = $state({
    showUploadModal: false, // Whether the upload modal is shown or not
    showLoginPage: true, // Whether the login page is shown or not
});

// Partitions states
export const partitions: { partitions: RAGPartition[]; currentPartition: RAGPartition | null } = $state({
    partitions: [], // List of all the partitions
    currentPartition: null, // Current partition selected by the user
});

// Files states
export const files: { currentFile: string | null } = $state({
    currentFile: null, // Current file selected by the user
});

// Tasks states
export const tasks: { tasks: RAGTaskInList[] } = $state({
    tasks: [], // List of all the tasks
});
