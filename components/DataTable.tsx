import React from 'react';
import { ON_SHAPE_PROPERTIES, ON_SHAPE_IDENTIFIER } from '../constants';
import type { ParsedRow, ColumnMap } from '../types';
import { UpdateStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon, InformationCircleIcon } from './icons';

interface DataTableProps {
  headers: string[];
  rows: ParsedRow[];
  columnMap: ColumnMap;
  setColumnMap: (map: ColumnMap) => void;
}

const statusIndicator = (status: UpdateStatus, errorMessage?: string) => {
  switch (status) {
    case UpdateStatus.Pending:
      return <ClockIcon className="h-5 w-5 text-yellow-400" title="Pending..." />;
    case UpdateStatus.Success:
      return <CheckCircleIcon className="h-5 w-5 text-green-400" title="Success" />;
    case UpdateStatus.Error:
      return (
        <div className="group relative flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            {errorMessage && 
             <div className="absolute left-full ml-2 w-48 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                {errorMessage}
             </div>
            }
        </div>
      );
    default:
      return <div className="h-5 w-5" />;
  }
};

export const DataTable: React.FC<DataTableProps> = ({ headers, rows, columnMap, setColumnMap }) => {
  const handleMapChange = (header: string, value: string) => {
    setColumnMap({ ...columnMap, [header]: value });
  };

  const allProperties = [ON_SHAPE_IDENTIFIER, ...ON_SHAPE_PROPERTIES];

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50 sticky top-0 backdrop-blur-sm z-5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">Status</th>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  <div className="flex flex-col">
                    <span className="mb-1">{header}</span>
                    <select
                      value={columnMap[header] || 'IGNORE'}
                      onChange={(e) => handleMapChange(header, e.target.value)}
                      className="text-xs bg-gray-600 border border-gray-500 rounded-md p-1 focus:ring-blue-500 focus:border-blue-500 text-white"
                    >
                      <option value="IGNORE">-- Ignore --</option>
                      {allProperties.map(prop => (
                        <option key={prop} value={prop}>{prop}</option>
                      ))}
                    </select>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-700/50 transition-colors duration-150">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    {statusIndicator(row.status, row.errorMessage)}
                  </div>
                </td>
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {row.data[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};