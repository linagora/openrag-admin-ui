/**
 * Formats a date
 * @param timestamp a timestamp, in seconds
 * @returns a date to the french format
 */
export const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('fr');
};