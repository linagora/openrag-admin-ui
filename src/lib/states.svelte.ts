/**
 * This file contains all the global runtime states of the application.
 * @author Ulysse Bouchet for LINAGORA
 */

// Import types
import type { RAGFile, RAGFileInList, RAGPartition, RAGTaskInList, Actor, UserInfo } from "$lib/types";

// UI States
export const ui: { showUploadModal: boolean; showLoginPage: boolean } = $state({
    showUploadModal: false, // Whether the upload modal is shown or not
    showLoginPage: true, // Whether the login page is shown or not
});

// Data states
export const indexerData: {
    partitions: RAGPartition[];
    currentPartition: { partition: RAGPartition | null; files: RAGFileInList[] };
    currentFile: RAGFile | null;
    tasks: RAGTaskInList[];
    userInfo: UserInfo | null;
} = $state({
    partitions: [], // List of all the partitions
    currentPartition: { partition: null, files: [] }, // Current partition selected by the user
    currentFile: null, // Current file selected by the user
    tasks: [], // List of all the tasks
    userInfo: null, // Current user information
});

export const dashboardData: {
    actors: Actor[];
} = $state({
    actors: [], // List of all the actors
});
