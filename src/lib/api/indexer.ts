// Base URL and auth token
import { getApiBaseUrl } from "./index";
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
    UserInfo,
} from "$lib/types";

/**
 * Fetches all available partitions
 */
export const fetchPartitions = async (): Promise<RAGPartition[]> => {
    console.log("Fetching partitions...");
    const response = await fetch(`${getApiBaseUrl()}/partition/`, {
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
    const response = await fetch(`${getApiBaseUrl()}/queue/tasks${status ? `?status=${status}` : ""}`, {
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
    const response = await fetch(`${getApiBaseUrl()}/indexer/task/${task}`, {
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
    const response = await fetch(`${getApiBaseUrl()}/partition/${partition}`, {
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
    const response = await fetch(`${getApiBaseUrl()}/partition/${partition}/file/${file_id}`, {
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
    const response = await fetch(`${getApiBaseUrl()}/extract/${extract_id}`, {
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
    const response = await fetch(`${getApiBaseUrl()}/partition/${partition}`, {
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

    const response = await fetch(`${getApiBaseUrl()}/indexer/partition/${partition}/file/${file_id}`, {
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
    const response = await fetch(`${getApiBaseUrl()}/indexer/partition/${partition}/file/${file_id}`, {
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

/**
 * Fetches current user information
 */
export const fetchUserInfo = async (): Promise<UserInfo> => {
    console.log("Fetching user info...");
    const response = await fetch(`${getApiBaseUrl()}/users/info`, {
        headers: {
            Authorization: `Bearer ${authToken.current}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("User info fetched: ", data);
    return data;
};
