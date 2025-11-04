import React, { useState } from 'react';
import type { OnshapeConfig as OnshapeConfigType } from '../types';
import { KeyIcon, LockClosedIcon } from './icons';

interface OnshapeConfigProps {
  onSave: (config: OnshapeConfigType) => void;
}

export const OnshapeConfig: React.FC<OnshapeConfigProps> = ({ onSave }) => {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey && secretKey) {
      onSave({ accessKey, secretKey });
      setIsSaved(true);
    } else {
      alert('Please fill in both API key fields.');
    }
  };
  
  const handleEdit = () => {
      setIsSaved(false);
  }

  if (isSaved) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-green-500/50">
          <div className="flex justify-between items-center">
              <div>
                  <h3 className="text-lg font-semibold text-green-400">Onshape API Keys Configured</h3>
                  <p className="text-sm text-gray-400">
                      You can now upload a file and sync your data to Onshape.
                  </p>
              </div>
              <button
                onClick={handleEdit}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Edit Keys
              </button>
          </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-1">Step 1: Configure Onshape API Keys</h3>
      <p className="text-sm text-gray-400 mb-4">
        Enter your API keys to connect your account. This allows the app to make changes on your behalf. 
        You can generate API keys in your Onshape account settings.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="accessKey" className="block text-sm font-medium text-gray-300">
              API Access Key
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="accessKey"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 pl-10 text-white focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  placeholder="Your Access Key"
                  required
                />
            </div>
          </div>
          <div>
            <label htmlFor="secretKey" className="block text-sm font-medium text-gray-300">
              API Secret Key
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="secretKey"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 pl-10 text-white focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  placeholder="Your Secret Key"
                  required
                />
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 p-2 bg-gray-900/50 rounded-md">
          <strong>Security Note:</strong> Your API keys are only used in your browser to make direct requests to Onshape and are not stored or sent anywhere else.
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            Save API Keys
          </button>
        </div>
      </form>
    </div>
  );
};