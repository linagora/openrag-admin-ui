/**
 * Represents a RAGondin partition (from the GET /partition/ endpoint)
 */
export interface RagondinPartition {
    partition: string;
    created_at: number;
}

/**
 * Represents a file in a partition (from the GET /partition/{partition}/ endpoint)
 */
export interface RagondinFile {
    link: string;
}