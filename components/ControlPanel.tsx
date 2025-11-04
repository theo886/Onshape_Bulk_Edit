import React, { useState } from 'react';
import { ON_SHAPE_IDENTIFIER, ON_SHAPE_PROPERTIES } from '../constants';
import type { ParsedRow, ColumnMap } from '../types';
import { UpdateStatus } from '../types';
import { SyncIcon, DocumentArrowUpIcon, DocumentArrowDownIcon, CloudArrowDownIcon } from './icons';
import { downloadFile } from '../utils/fileDownloader';

interface ControlPanelProps {
  onFileSelect: (file: File) => void;
  onSync: () => void;
  isSyncing: boolean;
  parsedRows: ParsedRow[];
  columnMap: ColumnMap;
  isConfigured: boolean;
  onDownloadAllParts: () => void;
  isFetchingParts: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onFileSelect,
  onSync,
  isSyncing,
  parsedRows,
  columnMap,
  isConfigured,
  onDownloadAllParts,
  isFetchingParts,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };
  
  const handleDownloadTemplate = () => {
    const csvHeader = [ON_SHAPE_IDENTIFIER, ...ON_SHAPE_PROPERTIES].join(',');
    downloadFile(csvHeader, 'onshape_properties_template.csv');
  };

  const isDataLoaded = parsedRows.length > 0;
  const isIdMapped = Object.values(columnMap).includes(ON_SHAPE_IDENTIFIER);

  const getSyncButtonTitle = () => {
    if (!isConfigured) return 'Please set your Onshape configuration first.';
    if (!isDataLoaded) return 'Load data to enable sync.';
    if (!isIdMapped) return `Map a column to '${ON_SHAPE_IDENTIFIER}' to enable sync.`;
    return 'Sync all changes to Onshape';
  }

  const summary = {
    total: parsedRows.length,
    success: parsedRows.filter(r => r.status === UpdateStatus.Success).length,
    error: parsedRows.filter(r => r.status === UpdateStatus.Error).length,
    pending: parsedRows.filter(r => r.status === UpdateStatus.Pending).length,
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="block text-sm font-medium text-gray-300 mb-2">
            Step 2: Load Part Data
          </h3>
          <div className="mt-2 flex flex-col space-y-3">
            <button
              onClick={onDownloadAllParts}
              disabled={!isConfigured || isFetchingParts}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              title={!isConfigured ? 'Please set your Onshape configuration first.' : 'Download a CSV of all parts from your account'}
            >
              {isFetchingParts ? (
                <>
                  <SyncIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Fetching Parts...
                </>
              ) : (
                <>
                  <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                  Download All Parts From Onshape
                </>
              )}
            </button>
            <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
             <label htmlFor="csv-upload" className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out text-center">
              <div className="flex items-center justify-center">
                <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                <span>{selectedFile ? 'Change File' : 'Upload CSV File'}</span>
              </div>
              <input id="csv-upload" name="csv-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
            </label>
            {selectedFile && <p className="text-sm text-gray-400 text-center truncate px-2">Selected: {selectedFile.name}</p>}
            
            <button
              onClick={handleDownloadTemplate}
              className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Download Blank Template
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Step 3: Sync to Onshape
            </h3>
            <div className="flex flex-col space-y-4">
              <button
                onClick={onSync}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={!isDataLoaded || isSyncing || !isIdMapped || !isConfigured}
                title={getSyncButtonTitle()}
              >
                {isSyncing ? (
                  <>
                    <SyncIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Syncing...
                  </>
                ) : (
                  'Sync to Onshape'
                )}
              </button>
            </div>
          </div>
          {isDataLoaded && (
             <div className="mt-4 text-sm text-gray-400 bg-gray-700/50 p-3 rounded-md">
                <p><strong>Total Rows:</strong> {summary.total}</p>
                { (summary.success > 0 || summary.error > 0 || summary.pending > 0) &&
                    <div className="flex justify-between items-center flex-wrap">
                        <p className="text-green-400 mr-2"><strong>Successful:</strong> {summary.success}</p>
                        <p className="text-red-400"><strong>Failed:</strong> {summary.error}</p>
                    </div>
                }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};