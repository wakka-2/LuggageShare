'use client';

import { useState } from 'react';
import { HandoffOption } from '@/lib/types/listing';

interface HandoffSelectionProps {
  options: HandoffOption[];
  onChange: (options: HandoffOption[]) => void;
}

const HANDOFF_TYPES = [
  {
    type: 'home_pickup' as const,
    label: 'Home Pickup',
    icon: '🏠',
    description: "Pick up from sender's home",
  },
  {
    type: 'mall_meetup' as const,
    label: 'Mall Meetup',
    icon: '🏬',
    description: 'Meet at a public location',
  },
  {
    type: 'airport_dropoff' as const,
    label: 'Airport Dropoff',
    icon: '✈️',
    description: 'Handoff at the airport',
  },
  {
    type: 'custom' as const,
    label: 'Custom Location',
    icon: '📍',
    description: 'Specify your own location',
  },
];

export function HandoffSelection({ options, onChange }: HandoffSelectionProps) {
  const [editingOption, setEditingOption] = useState<HandoffOption['type'] | null>(null);
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');

  const isSelected = (type: HandoffOption['type']) => {
    return options.some((opt) => opt.type === type);
  };

  const toggleOption = (type: HandoffOption['type']) => {
    if (isSelected(type)) {
      onChange(options.filter((opt) => opt.type !== type));
      setEditingOption(null);
    } else {
      setEditingOption(type);
    }
  };

  const saveOption = () => {
    if (!editingOption || !location.trim()) return;

    const newOption: HandoffOption = {
      type: editingOption,
      location: location.trim(),
      locationAr: location.trim(), // In production, get Arabic translation
      details: details.trim() || undefined,
    };

    onChange([...options.filter((opt) => opt.type !== editingOption), newOption]);
    setEditingOption(null);
    setLocation('');
    setDetails('');
  };

  const getOptionDetails = (type: HandoffOption['type']) => {
    return options.find((opt) => opt.type === type);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Handoff Options</h2>
      <p className="text-gray-600">How will you hand over or receive the items?</p>

      <div className="space-y-3">
        {HANDOFF_TYPES.map((handoffType) => {
          const selected = isSelected(handoffType.type);
          const optionDetails = getOptionDetails(handoffType.type);
          const isEditing = editingOption === handoffType.type;

          return (
            <div key={handoffType.type} className="border border-gray-300 rounded-lg">
              <button
                onClick={() => toggleOption(handoffType.type)}
                className={`w-full p-4 text-left transition-all ${
                  selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{handoffType.icon}</span>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{handoffType.label}</h3>
                      <p className="text-sm text-gray-500">{handoffType.description}</p>
                    </div>
                  </div>
                  {selected && (
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>

              {isEditing && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location address or name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Details (Optional)
                    </label>
                    <input
                      type="text"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Building number, floor, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveOption}
                      disabled={!location.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingOption(null);
                        setLocation('');
                        setDetails('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {selected && optionDetails && !isEditing && (
                <div className="p-4 border-t border-gray-200 bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{optionDetails.location}</p>
                      {optionDetails.details && (
                        <p className="text-sm text-gray-600 mt-1">{optionDetails.details}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingOption(handoffType.type);
                        setLocation(optionDetails.location);
                        setDetails(optionDetails.details || '');
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {options.length > 0 && (
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
              <h4 className="text-sm font-medium text-green-900 mb-1">Handoff Options Set</h4>
              <p className="text-sm text-green-700">
                You've selected {options.length} handoff option{options.length !== 1 ? 's' : ''}{' '}
                for flexibility.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
