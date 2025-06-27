/**
 * This file contains all the types related to partitions.
 * @author Ulysse Bouchet for LINAGORA
 */

/**
 * Represents a partition (from the GET /partition/ endpoint)
 */
export interface RAGPartition {
    partition: string;
    created_at: number;
}
