
// // import * as XLSX from 'xlsx';

// // export const downloadExcelFile = (data: any[][], fileName: string) => {
// //     const ws = XLSX.utils.aoa_to_sheet(data);
// //     const wb = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
// //     XLSX.writeFile(wb, fileName);
// // };


// /**
//  * File: src/utils/fileHelper.ts
//  * 
//  * CRITICAL UTILITY - Downloads blob data as files
//  * This function MUST exist for downloads to work
//  */

// /**
//  * Download blob data as a file
//  * @param blob - The blob data from API response
//  * @param filename - Name of the file to download
//  */
// export const downloadExcelFile = (blob: Blob, filename: string): void => {
//     try {
//         // Create a temporary URL for the blob
//         const url = window.URL.createObjectURL(blob);
        
//         // Create a temporary anchor element
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = filename;
        
//         // Append to body (required for Firefox)
//         document.body.appendChild(link);
        
//         // Trigger the download
//         link.click();
        
//         // Cleanup
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url);
        
//         console.log(`✅ Download triggered: ${filename}`);
//     } catch (error) {
//         console.error('❌ Download failed:', error);
//         throw new Error(`Failed to download file: ${filename}`);
//     }
// };

// /**
//  * Alternative download method (backup)
//  */
// export const downloadFile = (data: Blob, filename: string, mimeType: string): void => {
//     const blob = new Blob([data], { type: mimeType });
//     downloadExcelFile(blob, filename);
// };

// /**
//  * Download text content as file
//  */
// export const downloadTextFile = (content: string, filename: string): void => {
//     const blob = new Blob([content], { type: 'text/plain' });
//     downloadExcelFile(blob, filename);
// };

// /**
//  * Download JSON as file
//  */
// export const downloadJsonFile = (data: any, filename: string): void => {
//     const content = JSON.stringify(data, null, 2);
//     const blob = new Blob([content], { type: 'application/json' });
//     downloadExcelFile(blob, filename);
// };

// import * as XLSX from 'xlsx';

// export const downloadExcelFile = (data: any[][], fileName: string) => {
//     const ws = XLSX.utils.aoa_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
//     XLSX.writeFile(wb, fileName);
// };

/**
 * fileHelper.ts
 * Path: src/utils/fileHelper.ts
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ORIGINAL CONTRACT (kept intact):
 *   downloadExcelFile(blob: Blob, filename: string): void
 *   → accepts a Blob from an API response and triggers browser download.
 *
 * The file WAS working — the only breakage was that studentService.ts was
 * calling it with `any[][]` (row data) instead of a Blob.
 *
 * FIX STRATEGY: keep this file's signature as `(blob: Blob, filename)` so
 * it stays backward-compatible with every other existing call site (e.g.
 * exportStudentRegistry, bulkUpload, etc.). 
 *
 * studentService's `downloadCustomReport` and `downloadGatheredDataReport`
 * now call the NEW helper `downloadDataAsFile(data, filename)` below, which
 * converts any[][] → CSV Blob → then calls downloadExcelFile internally.
 *
 * Added helpers (non-breaking — existing imports still work):
 *   downloadDataAsFile(data: any[][], filename: string): void
 *   downloadFile(data: Blob, filename: string, mimeType: string): void
 *   downloadTextFile(content: string, filename: string): void
 *   downloadJsonFile(data: any, filename: string): void
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Download a Blob as a browser file.
 *
 * PRIMARY function — keeps the original signature.
 * All existing call sites that pass a Blob continue to work unchanged.
 *
 * @param blob     Blob received from API (responseType: 'blob')
 * @param filename Desired file name including extension (.xlsx, .csv, etc.)
 */
export const downloadExcelFile = (blob: Blob, filename: string): void => {
    try {
        const url  = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log(`✅ Download triggered: ${filename}`);
    } catch (error) {
        console.error('❌ Download failed:', error);
        throw new Error(`Failed to download file: ${filename}`);
    }
};

/**
 * Convert a 2D data array to a CSV Blob and download it.
 *
 * Use this when the caller has `any[][]` row data (NOT a Blob from the API).
 * Used by studentService's downloadCustomReport / downloadGatheredDataReport.
 *
 * If you add SheetJS later, swap the body of this function:
 *   import * as XLSX from 'xlsx';
 *   const ws = XLSX.utils.aoa_to_sheet(data);
 *   const wb = XLSX.utils.book_new();
 *   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
 *   XLSX.writeFile(wb, filename);
 *
 * @param data     2D array: first row = headers, subsequent rows = values
 * @param filename Desired file name. If .xlsx is requested, we change to .csv
 *                 automatically since we're generating CSV without SheetJS.
 */
export const downloadDataAsFile = (data: any[][], filename: string): void => {
    if (!data || data.length === 0) {
        console.warn('[downloadDataAsFile] Empty data — nothing to download');
        return;
    }

    // Serialise rows to CSV, quoting cells that contain commas/newlines/quotes
    const csvRows = data.map(row =>
        (row ?? []).map(cell => {
            const val = cell === null || cell === undefined ? '' : String(cell);
            if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                return '"' + val.replace(/"/g, '""') + '"';
            }
            return val;
        }).join(',')
    );

    const csvContent = csvRows.join('\n');

    // Force .csv extension — we're generating CSV, not binary xlsx
    const csvFilename = filename.replace(/\.(xlsx|xls)$/i, '.csv');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadExcelFile(blob, csvFilename);
};

/**
 * Alternative download with explicit mime type.
 * Wraps arbitrary data in a Blob then calls downloadExcelFile.
 */
export const downloadFile = (data: Blob, filename: string, mimeType: string): void => {
    const blob = new Blob([data], { type: mimeType });
    downloadExcelFile(blob, filename);
};

/**
 * Download a plain-text string as a .txt file.
 */
export const downloadTextFile = (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'text/plain' });
    downloadExcelFile(blob, filename);
};

/**
 * Download a JS object pretty-printed as .json.
 */
export const downloadJsonFile = (data: any, filename: string): void => {
    const content = JSON.stringify(data, null, 2);
    const blob    = new Blob([content], { type: 'application/json' });
    downloadExcelFile(blob, filename);
};