'use client';

import { ListingType } from '@/lib/types/listing';

interface TypeSelectionProps {
  value: ListingType | null;
  onChange: (type: ListingType) => void;
}

export function TypeSelection({ value, onChange }: TypeSelectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">What would you like to do?</h2>
      <p className="text-gray-600">Choose whether you want to offer luggage space or request it</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => onChange('offer')}
          className={`p-6 border-2 rounded-lg text-left transition-all ${
            value === 'offer'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Offer Space</h3>
              <p className="text-sm text-gray-600">
                I'm traveling and have extra luggage space to share
              </p>
            </div>
          </div>
          {value === 'offer' && (
            <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Selected
            </div>
          )}
        </button>

        <button
          onClick={() => onChange('request')}
          className={`p-6 border-2 rounded-lg text-left transition-all ${
            value === 'request'
              ? 'border-green-600 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Request Space</h3>
              <p className="text-sm text-gray-600">
                I need someone to bring items for me on their trip
              </p>
            </div>
          </div>
          {value === 'request' && (
            <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Selected
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
