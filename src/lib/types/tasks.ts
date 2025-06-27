/**
 * This file contains all the types related to tasks.
 * @author Ulysse Bouchet for LINAGORA
 */

/**
 * Represents the status of a task during the indexation process.
 * The status can be one of the following: QUEUED, SERIALIZING, CHUNKING, INSERTING, COMPLETED, FAILED.
 */
export type RAGTaskStatus = "QUEUED" | "SERIALIZING" | "CHUNKING" | "INSERTING" | "COMPLETED" | "FAILED";

/**
 *  Represents a task in the list of tasks (from the GET /queue/tasks/ endpoint).
 */
export interface RAGTaskInList {
    task_id: string;
    state: RAGTaskStatus;
    details: {
        file_id: string;
        partition: string;
        metadata: {};
    };
    url: string;
}

/**
 * Represents a specific task (from the GET /indexer/task/{task_id} endpoint).
 */
export interface RAGTask {
    task_id: string;
    task_state: RAGTaskStatus;
    details: {
        file_id: string;
        partition: string;
        metadata: {};
    };
}

/**
 * Represents all the files currently being uploaded in a partition.
 */
export interface ActiveUpload {
    partition: string;
    file_ids: string[];
}
