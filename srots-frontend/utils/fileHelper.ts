export const downloadExcelFile = (blob: Blob, filename: string): void => {
    try {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('❌ Download failed:', error);
        throw new Error(`Failed to download file: ${filename}`);
    }
};

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
    const blob = new Blob([content], { type: 'application/json' });
    downloadExcelFile(blob, filename);
};