'use client';

import { PricingTier, ListingType } from '@/lib/types/listing';

interface PricingSelectionProps {
  pricing: PricingTier;
  listingType: ListingType | null;
  onChange: (pricing: PricingTier) => void;
}

export function PricingSelection({ pricing, listingType, onChange }: PricingSelectionProps) {
  const updatePrice = (size: keyof Omit<PricingTier, 'negotiable'>, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...pricing, [size]: numValue });
  };

  const toggleNegotiable = () => {
    onChange({ ...pricing, negotiable: !pricing.negotiable });
  };

  const sizeInfo = {
    small: { label: 'Small', description: 'Up to 5kg (documents, electronics)', icon: '📱' },
    medium: { label: 'Medium', description: '5-10kg (clothes, accessories)', icon: '👜' },
    large: { label: 'Large', description: '10-20kg (multiple items)', icon: '🧳' },
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
      <p className="text-gray-600">
        {listingType === 'offer'
          ? 'Set your prices for different package sizes'
          : 'Set your budget for different package sizes'}
      </p>

      <div className="space-y-4">
        {(Object.keys(sizeInfo) as Array<keyof typeof sizeInfo>).map((size) => (
          <div key={size} className="p-4 border border-gray-300 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{sizeInfo[size].icon}</div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {sizeInfo[size].label}
                </label>
                <p className="text-sm text-gray-500 mb-3">{sizeInfo[size].description}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricing[size] || ''}
                    onChange={(e) => updatePrice(size, e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <span className="text-gray-500">USD</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border border-gray-300 rounded-lg">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={pricing.negotiable}
            onChange={toggleNegotiable}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-900">Price Negotiable</span>
            <p className="text-sm text-gray-500 mt-1">
              Allow potential matches to propose different prices
            </p>
          </div>
        </label>
      </div>

      {(pricing.small > 0 || pricing.medium > 0 || pricing.large > 0) && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900 mb-1">Pricing Set</h4>
              <p className="text-sm text-green-700">
                Your prices are competitive and clearly defined for potential matches.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
