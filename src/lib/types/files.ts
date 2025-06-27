/**
 * This file contains all the types related to files.
 * @author Ulysse Bouchet for LINAGORA
 */

/**
 * Represents a file in a partition (from the GET /partition/{partition}/ endpoint)
 */
export interface RAGFileInList {
    link: string;
}

/**
 * Represents a file in a partition (from the GET /partition/{partition}/file/{file_id} endpoint)
 */
export interface RAGFile {
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
export interface RAGExtract {
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
