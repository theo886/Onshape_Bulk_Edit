
import React from 'react';
import { InformationCircleIcon } from './icons';

export const Welcome: React.FC = () => {
  return (
    <div className="text-center bg-gray-800 p-8 md:p-12 rounded-lg shadow-lg border border-gray-700">
        <InformationCircleIcon className="mx-auto h-12 w-12 text-blue-400" />
      <h2 className="mt-4 text-xl font-semibold text-white">Welcome to the Onshape Bulk Property Editor</h2>
      <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
        To get started, upload a CSV file using the button above. You can also download a template to see the expected format and available properties.
      </p>
    </div>
  );
};
