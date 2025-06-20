/**
 * Formats a date
 * @param timestamp a timestamp, in seconds
 * @returns a date to the french format
 */
export const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('fr');
};

export const getStyleFromTaskState = (state: string): string => {
    switch (state) {
        case "QUEUED":
            return "text-slate-400";
        case "SERIALIZING":
            return "text-blue-500";
        case "CHUNKING":
            return "text-blue-500";
        case "INSERTING":
            return "text-blue-500";
        case "COMPLETED":
            return "text-pink-500";
        case "FAILED":
            return "text-red-500";
        default:
            return "text-black";
    }
}