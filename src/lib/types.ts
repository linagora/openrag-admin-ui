/**
 * Represents a RAGondin partition (from the GET /partition/ endpoint)
 */
export interface RagondinPartition {
    partition: string;
    created_at: number;
}

export type RagondinTaskStatus = "QUEUED" | "SERIALIZING" | "CHUNKING" | "INSERTING" | "COMPLETED" | "FAILED";

export interface RagondinTaskInList {
    task_id: string;
    state: RagondinTaskStatus
    details: {
        file_id: string;
        partition: string;
        metadata: {};
    };
    url: string;
}

export interface RagondinTask {
    task_id: string;
    task_state: RagondinTaskStatus;
    details: {
        file_id: string;
        partition: string;
        metadata: {};
    };
}

/**
 * Represents a file in a partition (from the GET /partition/{partition}/file/{file_id} endpoint)
 */
export interface RagondinFile {
    metadata: {
        partition: string;
        file_id: string;
        filename: string;
        page: number;
        page_sep: string;
        source: string;
    };
    documents: Array<{ link: string }>;
}

/**
 * Represents an extract from a file (from the GET /extract/{extract_id} endpoint)
 */
export interface RagondinExtract {
    metadata: {
        _id: string;
        partition: string;
        file_id: string;
        filename: string;
        page: number;
        page_sep: string;
        source: string;
    };
    page_content: string;
}

/**
 * Represents a file in a partition (from the GET /partition/{partition}/ endpoint)
 */
export interface RagondinFileInList {
    link: string;
}