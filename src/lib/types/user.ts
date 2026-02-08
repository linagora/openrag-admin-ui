/**
 * This file contains all the types related to user information.
 * @author Generated for LINAGORA
 */

import { ListFormat } from "typescript";

/**
 * Represents user information (from the GET /user/info endpoint)
 */
export interface UserInfo {
    id: string;
    display_name: string;
    is_admin: boolean;
    memberships: ListFormat;
    file_count: number;
    pending_files: number;
    total_files: number;
    file_quota: number; // -1 means infinite quota
}
