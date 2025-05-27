// API client for backend services
import type { RagondinFile, RagondinPartition } from './types';

// Removes the trailing slash from the base URL if it exists
const normalizeUrl = (url: string): string => {
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Retrieve the API base URL from the environment
export const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_BASE_URL);

/**
 * Fetches all available partitions
 */
export const fetchPartitions = async (): Promise<RagondinPartition[]> => {
  console.log("Fecthing partitions...");
  const response = await fetch(`${API_BASE_URL}/partition/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch partitions: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()).partitions;
  console.log("Partitions fetched : ", data)
  return data;
};

/**
 * Fetches files from a partition
 */
export const fetchFilesFromPartition = async (partition: string): Promise<RagondinFile[]> => {
  console.log(`Fetching files from partition "${partition}"...`)
  const response = await fetch(`${API_BASE_URL}/partition/${partition}`);

  if (!response.ok) {
    throw new Error(`Failed to get files: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()).files;
  console.log("Files fetched successfully : ", data);
  return data;
};

/**
 * Deletes a partition
 */
export const deletePartition = async (partition: string): Promise<boolean> => {
  console.log(`Deleting partition "${partition}"...`)
  const response = await fetch(`${API_BASE_URL}/partition/${partition}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete partition: ${response.status} ${response.statusText}`);
  }

  console.log(`Partition "${partition}" deleted successfully.`);
  return true;
};

/**
 * Adds a file to a partition
 */
export const addFile = async (
  file: File,
  partition: string,
  file_id: string,
  metadata?: string
): Promise<string> => {
  console.log(`Starting indexing file "${file.name}" to partition "${partition}"...`);
  const formData = new FormData();

  formData.append("file", file);
  if (metadata) formData.append("metadata", metadata);


  const response = await fetch(`${API_BASE_URL}/indexer/partition/${partition}/file/${file_id}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to index file: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()).task_status_url;
  console.log(`Indexing started successfully.`)
  return data;
};

/**
 * Deletes a file from a partition
 */
export const deleteFile = async (partition: string, file_id: string): Promise<boolean> => {
  console.log(`Deleting file "${file_id}" from partition "${partition}"...`)
  const response = await fetch(
    `${API_BASE_URL}/indexer/partition/${partition}/file/${file_id}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
  }

  console.log(`File "${file_id}" deleted successfully.`);
  return true;
};