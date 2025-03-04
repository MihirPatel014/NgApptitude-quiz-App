export const formatDate = (date: string | number | Date): string => {
    if (!date) return "N/A"; // Handle null/undefined cases

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid Date"; // Handle invalid dates

    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
    return parsedDate.toLocaleDateString("en-GB", options); // Returns "7 Feb 2025"
};
