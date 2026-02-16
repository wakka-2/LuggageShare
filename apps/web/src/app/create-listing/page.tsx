'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TypeSelection } from '@/components/create-listing/TypeSelection';
import { RouteSelection } from '@/components/create-listing/RouteSelection';
import { DateSelection } from '@/components/create-listing/DateSelection';
import { PricingSelection } from '@/components/create-listing/PricingSelection';
import { RestrictionsSelection } from '@/components/create-listing/RestrictionsSelection';
import { HandoffSelection } from '@/components/create-listing/HandoffSelection';
import { AdditionalDetails } from '@/components/create-listing/AdditionalDetails';
import { ProgressIndicator } from '@/components/create-listing/ProgressIndicator';
import { useCreateListing } from '@/hooks/useListings';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ListingType, PricingTier, ItemRestrictions, HandoffOption } from '@/lib/types/listing';

export interface ListingFormData {
  type: ListingType | null;
  from: { city: string; country: string; code: string } | null;
  to: { city: string; country: string; code: string } | null;
  travelDate: string;
  returnDate?: string;
  pricing: PricingTier;
  restrictions: ItemRestrictions;
  handoffOptions: HandoffOption[];
  title: string;
  description: string;
  availableWeight?: number;
  neededWeight?: number;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const createListing = useCreateListing();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>({
    type: null,
    from: null,
    to: null,
    travelDate: '',
    pricing: {
      small: 0,
      medium: 0,
      large: 0,
      negotiable: false,
    },
    restrictions: {
      allowed: [],
      notAllowed: [],
    },
    handoffOptions: [],
    title: '',
    description: '',
  });

  const totalSteps = 7;

  const updateFormData = (data: Partial<ListingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.from || !formData.to) return;

    if (isAuthenticated) {
      try {
        await createListing.mutateAsync({
          type: formData.type,
          departureCity: formData.from.city,
          departureCode: formData.from.code,
          arrivalCity: formData.to.city,
          arrivalCode: formData.to.code,
          departureDate: formData.travelDate,
          availableWeight: formData.availableWeight || 0,
          priceSmall: formData.pricing.small,
          priceMedium: formData.pricing.medium,
          priceLarge: formData.pricing.large,
          negotiable: formData.pricing.negotiable,
          title: formData.title || undefined,
          description: formData.description || undefined,
          restrictions: formData.restrictions as unknown as Record<string, unknown>,
          handoffOptions: formData.handoffOptions as unknown as Record<string, unknown>,
        });
        router.push('/listings');
      } catch {
        alert('حدث خطأ أثناء إنشاء الإعلان. حاول مرة أخرى.');
      }
    } else {
      // Not authenticated - show mock success
      alert('يرجى تسجيل الدخول لإنشاء إعلان');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.type !== null;
      case 2:
        return formData.from !== null && formData.to !== null;
      case 3:
        return formData.travelDate !== '';
      case 4:
        return formData.pricing.small > 0 || formData.pricing.medium > 0 || formData.pricing.large > 0;
      case 5:
        return formData.restrictions.allowed.length > 0;
      case 6:
        return formData.handoffOptions.length > 0;
      case 7:
        return formData.title.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إنشاء إعلان</h1>
          <p className="text-gray-600 mb-6">
            {formData.type === 'offer'
              ? 'قدم مساحة أمتعتك لمساعدة الآخرين'
              : formData.type === 'request'
              ? 'اطلب مساحة أمتعة لممتلكاتك'
              : 'شارك خطط سفرك وتواصل مع الآخرين'}
          </p>

          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

          <div className="mt-8">
            {currentStep === 1 && (
              <TypeSelection
                value={formData.type}
                onChange={(type) => updateFormData({ type })}
              />
            )}
            {currentStep === 2 && (
              <RouteSelection
                from={formData.from}
                to={formData.to}
                onChange={(route) => updateFormData(route)}
              />
            )}
            {currentStep === 3 && (
              <DateSelection
                travelDate={formData.travelDate}
                returnDate={formData.returnDate}
                onChange={(dates) => updateFormData(dates)}
              />
            )}
            {currentStep === 4 && (
              <PricingSelection
                pricing={formData.pricing}
                listingType={formData.type}
                onChange={(pricing) => updateFormData({ pricing })}
              />
            )}
            {currentStep === 5 && (
              <RestrictionsSelection
                restrictions={formData.restrictions}
                onChange={(restrictions) => updateFormData({ restrictions })}
              />
            )}
            {currentStep === 6 && (
              <HandoffSelection
                options={formData.handoffOptions}
                onChange={(handoffOptions) => updateFormData({ handoffOptions })}
              />
            )}
            {currentStep === 7 && (
              <AdditionalDetails
                title={formData.title}
                description={formData.description}
                availableWeight={formData.availableWeight}
                neededWeight={formData.neededWeight}
                listingType={formData.type}
                onChange={(details) => updateFormData(details)}
              />
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              رجوع
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || createListing.isPending}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createListing.isPending ? 'جاري الإنشاء...' : 'إنشاء الإعلان'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
