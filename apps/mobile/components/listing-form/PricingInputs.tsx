import { View, Text, StyleSheet, TextInput, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PricingTier, ListingType } from '@/components/listings/types';

interface PricingInputsProps {
  listingType: ListingType;
  weight: number;
  pricing: PricingTier;
  onWeightChange: (weight: number) => void;
  onPricingChange: (pricing: PricingTier) => void;
}

export function PricingInputs({
  listingType,
  weight,
  pricing,
  onWeightChange,
  onPricingChange,
}: PricingInputsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const isOffer = listingType === 'offer';

  const updatePricing = (key: keyof PricingTier, value: number | boolean) => {
    onPricingChange({ ...pricing, [key]: value });
  };

  const weightPresets = isOffer ? [5, 10, 15, 20, 25, 30] : [1, 2, 5, 10, 15, 20];

  return (
    <Animated.View entering={FadeIn.delay(300)} style={styles.container}>
      {/* Weight Input */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>
          {isOffer ? t('listing.availableWeight') : t('listing.neededWeight')}
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {isOffer ? t('listing.availableWeightHint') : t('listing.neededWeightHint')}
        </Text>

        <View style={styles.weightPresets}>
          {weightPresets.map((preset) => {
            const isSelected = weight === preset;
            return (
              <Pressable
                key={preset}
                onPress={() => onWeightChange(preset)}
                style={[
                  styles.weightChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.weightChipText,
                    { color: isSelected ? '#fff' : colors.text },
                  ]}
                >
                  {preset} kg
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.customWeightContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="scale-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.weightInput, { color: colors.text }]}
            placeholder={t('listing.customWeight')}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={weight > 0 ? String(weight) : ''}
            onChangeText={(text) => onWeightChange(parseInt(text) || 0)}
          />
          <Text style={[styles.weightUnit, { color: colors.textSecondary }]}>kg</Text>
        </View>
      </View>

      {/* Pricing Tiers */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>{t('listing.pricing')}</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {t('listing.pricingHint')}
        </Text>

        <View style={styles.pricingTiers}>
          {/* Small Package */}
          <View style={[styles.pricingTier, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="cube-outline" size={18} color={colors.success} />
              </View>
              <View style={styles.tierInfo}>
                <Text style={[styles.tierTitle, { color: colors.text }]}>{t('listing.small')}</Text>
                <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{t('listing.smallDesc')}</Text>
              </View>
            </View>
            <View style={styles.priceInputWrapper}>
              <Text style={[styles.currency, { color: colors.textSecondary }]}>SAR</Text>
              <TextInput
                style={[styles.priceInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={pricing.small > 0 ? String(pricing.small) : ''}
                onChangeText={(text) => updatePricing('small', parseInt(text) || 0)}
              />
            </View>
          </View>

          {/* Medium Package */}
          <View style={[styles.pricingTier, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="cube" size={18} color={colors.warning} />
              </View>
              <View style={styles.tierInfo}>
                <Text style={[styles.tierTitle, { color: colors.text }]}>{t('listing.medium')}</Text>
                <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{t('listing.mediumDesc')}</Text>
              </View>
            </View>
            <View style={styles.priceInputWrapper}>
              <Text style={[styles.currency, { color: colors.textSecondary }]}>SAR</Text>
              <TextInput
                style={[styles.priceInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={pricing.medium > 0 ? String(pricing.medium) : ''}
                onChangeText={(text) => updatePricing('medium', parseInt(text) || 0)}
              />
            </View>
          </View>

          {/* Large Package */}
          <View style={[styles.pricingTier, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="cube" size={22} color={colors.error} />
              </View>
              <View style={styles.tierInfo}>
                <Text style={[styles.tierTitle, { color: colors.text }]}>{t('listing.large')}</Text>
                <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{t('listing.largeDesc')}</Text>
              </View>
            </View>
            <View style={styles.priceInputWrapper}>
              <Text style={[styles.currency, { color: colors.textSecondary }]}>SAR</Text>
              <TextInput
                style={[styles.priceInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={pricing.large > 0 ? String(pricing.large) : ''}
                onChangeText={(text) => updatePricing('large', parseInt(text) || 0)}
              />
            </View>
          </View>
        </View>

        {/* Negotiable Toggle */}
        <View style={[styles.negotiableRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.negotiableInfo}>
            <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
            <View style={styles.negotiableText}>
              <Text style={[styles.negotiableTitle, { color: colors.text }]}>{t('listing.negotiable')}</Text>
              <Text style={[styles.negotiableDesc, { color: colors.textSecondary }]}>
                {t('listing.negotiableDesc')}
              </Text>
            </View>
          </View>
          <Switch
            value={pricing.negotiable}
            onValueChange={(value) => updatePricing('negotiable', value)}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={pricing.negotiable ? colors.primary : colors.textSecondary}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    marginBottom: 12,
  },
  weightPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  weightChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  weightChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  weightInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    padding: 0,
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  pricingTiers: {
    gap: 12,
  },
  pricingTier: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  tierIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierInfo: {
    flex: 1,
  },
  tierTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  tierDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currency: {
    fontSize: 13,
    fontWeight: '500',
  },
  priceInput: {
    width: 70,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  negotiableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  negotiableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  negotiableText: {
    flex: 1,
  },
  negotiableTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  negotiableDesc: {
    fontSize: 12,
    marginTop: 2,
  },
});
