// API client for backend services

// API base URL with fixed port 8081
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all available partitions
 */
export const fetchPartitions = async () => {
  try {
    console.log("Fetching partitions from API...");
    const response = await fetch(`${API_BASE_URL}/partition/`);

    if (!response.ok) {
      throw new Error(`Failed to fetch partitions: ${response.status} ${response.statusText}`);
    }

    console.log("done")
    return (await response.json()).partitions;
  } catch (error) {
    console.error("Error fetching partitions:", error);
    throw error;
  }
}

export const deletePartition = async (partition: string) => {
  try {
    console.log("Deleting partition from API...");
    const response = await fetch(`${API_BASE_URL}/partition/${partition}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete partition: ${response.status} ${response.statusText}`);
    }

    return (await response.json()).message;
  } catch (error) {
    console.error("Error deleting partition:", error);
    throw error;
  }
}

export const indexFile = async (file: File, partition: string, file_id: string, metadata?: string) => {
  try {
    console.log("Indexing file to partition...");
    const formData = new FormData();
    formData.append("file", file);
    if (metadata)
      formData.append("metadata", metadata);

    const response = await fetch(`${API_BASE_URL}/indexer/partition/${partition}/file/${file_id}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to add file: ${response.status} ${response.statusText}`);
    }

    return (response);
  } catch (error) {
    console.error("Error adding file:", error);
    throw error;
  }
}

export const getFilesFromPartition = async (partition: string) => {
  try {
    console.log("Fetching files from partition...");
    const response = await fetch(`${API_BASE_URL}/partition/${partition}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
    }

    return (await response.json()).files;
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
}