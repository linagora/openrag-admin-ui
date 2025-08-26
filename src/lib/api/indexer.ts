// Base URL and auth token
import { API_BASE_URL } from ".";
import { authToken } from "$lib/persisted.svelte";

// Types
import type {
    RAGExtract,
    RAGFile,
    RAGFileInList,
    RAGPartition,
    RAGTask,
    RAGTaskInList,
    RAGTaskStatus,
} from "$lib/types";

/**
 * Fetches all available partitions
 */
export const fetchPartitions = async (): Promise<RAGPartition[]> => {
    console.log("Fetching partitions...");
    const response = await fetch(`${API_BASE_URL}/partition/`, {
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch partitions: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()).partitions;
    console.log("Partitions fetched : ", data);
    return data;
};

/**
 * Fetches tasks
 */
export const fetchTasks = async (status?: RAGTaskStatus | "ACTIVE"): Promise<RAGTaskInList[]> => {
    console.log(`Fetching tasks${status ? ` with ${status} status` : ``}...`);
    const response = await fetch(`${API_BASE_URL}/queue/tasks${status ? `?status=${status}` : ""}`, {
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()).tasks;
    console.log("Tasks fetched : ", data);
    return data;
};

/**
 * Fetches one task
 */
export const fetchTask = async (task: string): Promise<RAGTask> => {
    console.log(`Fetching task ${task}...`);
    const response = await fetch(`${API_BASE_URL}/indexer/task/${task}`, {
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch task: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Task fetched : ", data);
    return data;
};

/**
 * Fetches files from a partition
 */
export const fetchFilesFromPartition = async (partition: string): Promise<RAGFileInList[]> => {
    console.log(`Fetching files from partition "${partition}"...`);
    const response = await fetch(`${API_BASE_URL}/partition/${partition}`, {
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()).files;
    console.log("Files fetched successfully : ", data);
    return data;
};

/**
 * Fetches files from a partition
 */
export const fetchFile = async (partition: string, file_id: string): Promise<RAGFile> => {
    console.log(`Fetching file "${file_id}" from partition "${partition}"...`);
    const response = await fetch(`${API_BASE_URL}/partition/${partition}/file/${file_id}`, {
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("File fetched successfully : ", data);
    return data;
};

/**
 * Fetches the extract of a file
 */
export const fetchExtract = async (extract_id: string): Promise<RAGExtract> => {
    console.log(`Fetching extract "${extract_id}"...`);
    const response = await fetch(`${API_BASE_URL}/extract/${extract_id}`, {
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch extract: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Extract fetched successfully : ", data);
    return data;
};

/**
 * Deletes a partition
 */
export const deletePartition = async (partition: string): Promise<boolean> => {
    console.log(`Deleting partition "${partition}"...`);
    const response = await fetch(`${API_BASE_URL}/partition/${partition}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete partition: ${response.status} ${response.statusText}`);
    }

    console.log(`Partition "${partition}" deleted successfully.`);
    return true;
};

/**
 * Adds a file to a partition
 */
export const addFile = async (file: File, partition: string, file_id: string, metadata?: string): Promise<string> => {
    console.log(`Starting indexing file "${file.name}" to partition "${partition}"...`);
    const formData = new FormData();

    formData.append("file", file);
    if (metadata) formData.append("metadata", metadata);

    const response = await fetch(`${API_BASE_URL}/indexer/partition/${partition}/file/${file_id}`, {
        method: "POST",
        body: formData,
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to index file: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()).task_status_url;
    console.log(`Indexing started successfully.`);
    return data;
};

/**
 * Deletes a file from a partition
 */
export const deleteFile = async (partition: string, file_id: string): Promise<boolean> => {
    console.log(`Deleting file "${file_id}" from partition "${partition}"...`);
    const response = await fetch(`${API_BASE_URL}/indexer/partition/${partition}/file/${file_id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
    }

    console.log(`File "${file_id}" deleted successfully.`);
    return true;
};
