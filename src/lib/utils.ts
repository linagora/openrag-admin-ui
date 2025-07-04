/**
 * This file contains various utility functions.
 * @author Ulysse Bouchet for LINAGORA
 */

// Import states
import { data } from "$lib/states.svelte";

// Import types
import type { ActiveUpload } from "$lib/types";

/**
 * Formats a date
 * @param dateString an ISO 8601 formatted date string
 * @returns a date in the French format
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString("fr");
}

/**
 * Gives a style to apply to a task state
 * @param state the state of a task, as a string
 * @returns a string representing the style to apply to the task state
 */
export function getStyleFromTaskState(state: string): string {
    switch (state) {
        case "QUEUED":
            return "text-slate-400";
        case "SERIALIZING":
        case "CHUNKING":
        case "INSERTING":
            return "text-blue-500";
        case "COMPLETED":
            return "text-linagora-500";
        case "FAILED":
            return "text-red-500";
        default:
            return "text-black";
    }
}

/**
 * Calculates the upload progress % of a given upload
 * @param upload the upload to calculate the progress for
 * @returns the upload progress as a percentage
 */
export function getUploadProgress(upload: ActiveUpload): {
    status: "IN PROGRESS" | "SUCCESS" | "FAILED";
    progress: number;
    completedFiles: number;
    failedFiles: number;
} {
    const totalFiles = upload.file_ids.length;
    const completedFiles = data.tasks.filter(
        (task) => upload.file_ids.includes(task.details.file_id) && task.state === "COMPLETED"
    ).length;

    const failedFiles = data.tasks.filter(
        (task) => upload.file_ids.includes(task.details.file_id) && task.state === "FAILED"
    ).length;

    const progress = totalFiles > 0 ? Math.round(((completedFiles + failedFiles) / totalFiles) * 100) : 0;
    const status =
        completedFiles === totalFiles
            ? "SUCCESS"
            : failedFiles + completedFiles === totalFiles
              ? "FAILED"
              : "IN PROGRESS";

    return { status, progress, completedFiles, failedFiles };
}
