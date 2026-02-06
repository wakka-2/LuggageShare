'use client';

import { ListingType } from '@/lib/types/listing';

interface AdditionalDetailsProps {
  title: string;
  description: string;
  availableWeight?: number;
  neededWeight?: number;
  listingType: ListingType | null;
  onChange: (details: {
    title: string;
    description: string;
    availableWeight?: number;
    neededWeight?: number;
  }) => void;
}

export function AdditionalDetails({
  title,
  description,
  availableWeight,
  neededWeight,
  listingType,
  onChange,
}: AdditionalDetailsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Additional Details</h2>
      <p className="text-gray-600">Provide more information about your listing</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange({ title: e.target.value, description, availableWeight, neededWeight })}
            placeholder={
              listingType === 'offer'
                ? 'e.g., NYC to Dubai - Extra 15kg luggage space'
                : 'e.g., Need delivery from London to Riyadh'
            }
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">{title.length}/100 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onChange({ title, description: e.target.value, availableWeight, neededWeight })}
            placeholder={
              listingType === 'offer'
                ? 'Describe your trip and what you can help with...'
                : 'Describe what you need delivered...'
            }
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">{description.length}/500 characters</p>
        </div>

        {listingType === 'offer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Luggage Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={availableWeight || ''}
              onChange={(e) =>
                onChange({
                  title,
                  description,
                  availableWeight: parseFloat(e.target.value) || undefined,
                  neededWeight,
                })
              }
              placeholder="e.g., 15"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              How much extra space do you have available?
            </p>
          </div>
        )}

        {listingType === 'request' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Needed Luggage Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={neededWeight || ''}
              onChange={(e) =>
                onChange({
                  title,
                  description,
                  availableWeight,
                  neededWeight: parseFloat(e.target.value) || undefined,
                })
              }
              placeholder="e.g., 10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              How much weight do you need transported?
            </p>
          </div>
        )}
      </div>

      {title.trim() && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Listing Preview</h4>
              <p className="text-sm text-blue-700">
                Your listing is ready! Review all steps and click "Create Listing" when ready.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
