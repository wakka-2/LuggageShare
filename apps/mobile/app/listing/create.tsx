import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import {
  ListingTypeSelector,
  RouteSelector,
  DateSelector,
  PricingInputs,
  RestrictionsSelector,
  HandoffSelector,
  City,
} from '@/components/listing-form';
import {
  ListingType,
  PricingTier,
  ItemRestrictions,
  HandoffOption,
} from '@/components/listings/types';

interface FormData {
  type: ListingType;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  from: City | null;
  to: City | null;
  travelDate: Date | null;
  returnDate: Date | null;
  weight: number;
  pricing: PricingTier;
  restrictions: ItemRestrictions;
  handoffOptions: HandoffOption[];
}

const initialFormData: FormData = {
  type: 'offer',
  title: '',
  titleAr: '',
  description: '',
  descriptionAr: '',
  from: null,
  to: null,
  travelDate: null,
  returnDate: null,
  weight: 0,
  pricing: { small: 0, medium: 0, large: 0, negotiable: true },
  restrictions: { allowed: [], notAllowed: [], notes: '' },
  handoffOptions: [],
};

const STEPS = ['type', 'route', 'date', 'pricing', 'restrictions', 'handoff', 'details'] as const;
type Step = (typeof STEPS)[number];

export default function CreateListingScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const isArabic = i18n.language === 'ar';

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = (): boolean => {
    const step = STEPS[currentStep];
    switch (step) {
      case 'type':
        return true; // Always valid
      case 'route':
        return formData.from !== null && formData.to !== null;
      case 'date':
        return formData.travelDate !== null;
      case 'pricing':
        return formData.weight > 0 && (formData.pricing.small > 0 || formData.pricing.medium > 0 || formData.pricing.large > 0);
      case 'restrictions':
        return formData.restrictions.allowed.length > 0;
      case 'handoff':
        return formData.handoffOptions.length > 0;
      case 'details':
        return formData.title.trim().length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Send to API
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      Alert.alert(
        t('listing.listingCreated'),
        t('listing.listingCreatedDesc'),
        [
          { text: t('listing.createAnother'), onPress: () => {
            setFormData(initialFormData);
            setCurrentStep(0);
          }},
          { text: t('listing.viewListing'), onPress: () => router.replace('/(tabs)') },
        ]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];

    switch (step) {
      case 'type':
        return (
          <ListingTypeSelector
            value={formData.type}
            onChange={(type) => updateFormData('type', type)}
          />
        );

      case 'route':
        return (
          <RouteSelector
            from={formData.from}
            to={formData.to}
            onFromChange={(city) => updateFormData('from', city)}
            onToChange={(city) => updateFormData('to', city)}
          />
        );

      case 'date':
        return (
          <DateSelector
            date={formData.travelDate}
            returnDate={formData.returnDate}
            onDateChange={(date) => updateFormData('travelDate', date)}
            onReturnDateChange={(date) => updateFormData('returnDate', date)}
            showReturnDate={formData.type === 'offer'}
          />
        );

      case 'pricing':
        return (
          <PricingInputs
            listingType={formData.type}
            weight={formData.weight}
            pricing={formData.pricing}
            onWeightChange={(weight) => updateFormData('weight', weight)}
            onPricingChange={(pricing) => updateFormData('pricing', pricing)}
          />
        );

      case 'restrictions':
        return (
          <RestrictionsSelector
            restrictions={formData.restrictions}
            onRestrictionsChange={(restrictions) => updateFormData('restrictions', restrictions)}
          />
        );

      case 'handoff':
        return (
          <HandoffSelector
            handoffOptions={formData.handoffOptions}
            onHandoffOptionsChange={(options) => updateFormData('handoffOptions', options)}
          />
        );

      case 'details':
        return (
          <Animated.View entering={FadeIn}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('listing.title')}</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={t('listing.titlePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              maxLength={100}
            />

            {isArabic && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 16 }]}>
                  {t('listing.title')} (English)
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                  ]}
                  placeholder="Trip to Dubai - 20kg available"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.titleAr}
                  onChangeText={(text) => updateFormData('titleAr', text)}
                  maxLength={100}
                />
              </>
            )}

            <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 20 }]}>
              {t('listing.description')} ({t('common.optional')})
            </Text>
            <TextInput
              style={[
                styles.textAreaInput,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={t('listing.descriptionPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const step = STEPS[currentStep];
    switch (step) {
      case 'type': return t('listing.selectType');
      case 'route': return t('listing.route');
      case 'date': return t('listing.travelDate');
      case 'pricing': return t('listing.pricing');
      case 'restrictions': return t('listing.allowedItems');
      case 'handoff': return t('listing.handoffOptions');
      case 'details': return t('listing.title');
      default: return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${((currentStep + 1) / STEPS.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentStep + 1} / {STEPS.length}
        </Text>
      </View>

      {/* Step Title */}
      <Animated.View
        key={currentStep}
        entering={SlideInRight.springify()}
        style={styles.stepHeader}
      >
        <Text style={[styles.stepTitle, { color: colors.text }]}>{getStepTitle()}</Text>
      </Animated.View>

      {/* Form Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View key={currentStep} entering={FadeInDown.delay(100)}>
            {renderStepContent()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          onPress={prevStep}
          style={[styles.backButton, { borderColor: colors.border }]}
        >
          <Ionicons name={isArabic ? 'chevron-forward' : 'chevron-back'} size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>{t('common.back')}</Text>
        </Pressable>

        <Pressable
          onPress={nextStep}
          disabled={!canProceed() || isSubmitting}
          style={[
            styles.nextButton,
            {
              backgroundColor: canProceed() ? colors.primary : colors.border,
              opacity: isSubmitting ? 0.7 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <Text style={styles.nextButtonText}>{t('common.loading')}</Text>
          ) : currentStep === STEPS.length - 1 ? (
            <>
              <Text style={styles.nextButtonText}>{t('listing.publishListing')}</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>{t('common.next')}</Text>
              <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={20} color="#fff" />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  stepHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
