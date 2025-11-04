
interface ParsedCsv {
    headers: string[];
    data: Record<string, string>[];
}

export const parseCsv = (csvText: string): ParsedCsv => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length === 0) {
        return { headers: [], data: [] };
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header] = (values[index] || '').trim();
        });
        data.push(row);
    }

    return { headers, data };
};
