import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { DataTable } from './components/DataTable';
import { Welcome } from './components/Welcome';
import { OnshapeConfig } from './components/OnshapeConfig';
import { parseCsv } from './utils/csvParser';
import { ON_SHAPE_IDENTIFIER, ON_SHAPE_PROPERTIES } from './constants';
import { onshapeService } from './services/onshapeService';
import type { ParsedRow, ColumnMap, OnshapeConfig as OnshapeConfigType } from './types';
import { UpdateStatus } from './types';
import { downloadFile } from './utils/fileDownloader';

export default function App() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [columnMap, setColumnMap] = useState<ColumnMap>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [onshapeConfig, setOnshapeConfig] = useState<OnshapeConfigType | null>(null);
  const [isFetchingParts, setIsFetchingParts] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      if (!csvData || !csvData.trim()) {
        setHeaders([]);
        setParsedRows([]);
        setColumnMap({});
        return;
      }
      try {
        const { headers: newHeaders, data } = parseCsv(csvData);
        setHeaders(newHeaders);
        setParsedRows(
          data.map((row, index) => ({
            id: `row-${index}-${Date.now()}`,
            data: row,
            status: UpdateStatus.Idle,
          }))
        );
        // Auto-map based on header names
        const initialMap: ColumnMap = {};
        newHeaders.forEach(h => {
          if (h.toLowerCase().includes('url')) {
            initialMap[h] = ON_SHAPE_IDENTIFIER;
          } else {
            initialMap[h] = 'IGNORE';
          }
        });
        setColumnMap(initialMap);
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        alert('Failed to parse CSV data. Please check the format.');
      }
    };
    reader.onerror = () => {
        console.error('Failed to read file:', reader.error);
        alert('Failed to read the selected file.');
    };
    reader.readAsText(file);
  }, []);

  const handleDownloadAllParts = useCallback(async () => {
    if (!onshapeConfig) {
      alert('Please configure your Onshape API Keys first.');
      return;
    }
    setIsFetchingParts(true);
    try {
      const parts = await onshapeService.getAllParts(onshapeConfig);
      if (!parts || parts.length === 0) {
        alert("No parts found in your account or an error occurred while fetching.");
        return;
      }

      const headers = [ON_SHAPE_IDENTIFIER, ...ON_SHAPE_PROPERTIES];
      const csvHeader = headers.join(',');
      const csvRows = parts.map(part => {
        return headers.map(header => {
          const value = part[header] || '';
          // Basic CSV escaping for values containing commas or quotes
          const escapedValue = value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
          return escapedValue;
        }).join(',');
      });

      const csvContent = [csvHeader, ...csvRows].join('\n');
      downloadFile(csvContent, 'onshape_all_parts.csv');

    } catch (error) {
      console.error('Failed to download all parts:', error);
      alert('An error occurred while fetching your parts from Onshape.');
    } finally {
      setIsFetchingParts(false);
    }
}, [onshapeConfig]);

  const handleSync = useCallback(async () => {
    if (!onshapeConfig) {
      alert('Please configure your Onshape API Keys first.');
      return;
    }

    const identifierHeader = Object.keys(columnMap).find(
      (header) => columnMap[header] === ON_SHAPE_IDENTIFIER
    );

    if (!identifierHeader) {
      alert(`Please map a column to '${ON_SHAPE_IDENTIFIER}' to identify which parts to update.`);
      return;
    }

    setIsSyncing(true);
    setParsedRows(rows => rows.map(row => ({ ...row, status: UpdateStatus.Pending, errorMessage: undefined })));
    
    type UpdatePromiseResult = {
      success: boolean;
      rowId: string;
      error?: string;
    };

    const updatePromises = parsedRows.map((row): Promise<UpdatePromiseResult> => {
      const partUrl = row.data[identifierHeader];
      const propertiesToUpdate = Object.entries(columnMap)
        .filter(([, prop]) => prop !== ON_SHAPE_IDENTIFIER && prop !== 'IGNORE')
        .reduce((acc, [header, prop]) => {
          if (row.data[header] !== undefined) {
            acc[prop] = row.data[header];
          }
          return acc;
        }, {} as Record<string, string>);
      
      if (Object.keys(propertiesToUpdate).length === 0) {
        return Promise.resolve({ success: true, rowId: row.id });
      }

      return onshapeService.updatePartProperties(partUrl, propertiesToUpdate, onshapeConfig)
        .then(result => ({ ...result, rowId: row.id }));
    });

    const results = await Promise.allSettled(updatePromises);

    setParsedRows(currentRows => {
      const newRows = [...currentRows];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          const { success, error, rowId } = result.value;
          const rowIndex = newRows.findIndex(r => r.id === rowId);
          if (rowIndex !== -1) {
            newRows[rowIndex].status = success ? UpdateStatus.Success : UpdateStatus.Error;
            newRows[rowIndex].errorMessage = error;
          }
        }
      });
      return newRows;
    });

    setIsSyncing(false);
  }, [columnMap, parsedRows, onshapeConfig]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        <OnshapeConfig onSave={setOnshapeConfig} />
        <ControlPanel
          onFileSelect={handleFileSelect}
          onSync={handleSync}
          isSyncing={isSyncing}
          parsedRows={parsedRows}
          columnMap={columnMap}
          isConfigured={!!onshapeConfig}
          onDownloadAllParts={handleDownloadAllParts}
          isFetchingParts={isFetchingParts}
        />
        <div>
          {parsedRows.length > 0 ? (
            <DataTable
              headers={headers}
              rows={parsedRows}
              columnMap={columnMap}
              setColumnMap={setColumnMap}
            />
          ) : (
            <Welcome />
          )}
        </div>
      </main>
    </div>
  );
}