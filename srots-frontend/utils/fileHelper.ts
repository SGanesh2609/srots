
// import * as XLSX from 'xlsx';

// export const downloadExcelFile = (data: any[][], fileName: string) => {
//     const ws = XLSX.utils.aoa_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
//     XLSX.writeFile(wb, fileName);
// };


/**
 * File: src/utils/fileHelper.ts
 * 
 * CRITICAL UTILITY - Downloads blob data as files
 * This function MUST exist for downloads to work
 */

/**
 * Download blob data as a file
 * @param blob - The blob data from API response
 * @param filename - Name of the file to download
 */
export const downloadExcelFile = (blob: Blob, filename: string): void => {
    try {
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // Append to body (required for Firefox)
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log(`✅ Download triggered: ${filename}`);
    } catch (error) {
        console.error('❌ Download failed:', error);
        throw new Error(`Failed to download file: ${filename}`);
    }
};

/**
 * Alternative download method (backup)
 */
export const downloadFile = (data: Blob, filename: string, mimeType: string): void => {
    const blob = new Blob([data], { type: mimeType });
    downloadExcelFile(blob, filename);
};

/**
 * Download text content as file
 */
export const downloadTextFile = (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'text/plain' });
    downloadExcelFile(blob, filename);
};

/**
 * Download JSON as file
 */
export const downloadJsonFile = (data: any, filename: string): void => {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    downloadExcelFile(blob, filename);
};