import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ITEM_CATEGORIES, ItemRestrictions } from '@/components/listings/types';

interface RestrictionsSelectorProps {
  restrictions: ItemRestrictions;
  onRestrictionsChange: (restrictions: ItemRestrictions) => void;
}

export function RestrictionsSelector({ restrictions, onRestrictionsChange }: RestrictionsSelectorProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const toggleAllowed = (key: string) => {
    const newAllowed = restrictions.allowed.includes(key)
      ? restrictions.allowed.filter((k) => k !== key)
      : [...restrictions.allowed, key];
    onRestrictionsChange({ ...restrictions, allowed: newAllowed });
  };

  const toggleNotAllowed = (key: string) => {
    const newNotAllowed = restrictions.notAllowed.includes(key)
      ? restrictions.notAllowed.filter((k) => k !== key)
      : [...restrictions.notAllowed, key];
    onRestrictionsChange({ ...restrictions, notAllowed: newNotAllowed });
  };

  const updateNotes = (notes: string) => {
    onRestrictionsChange({ ...restrictions, notes });
  };

  return (
    <Animated.View entering={FadeIn.delay(400)} style={styles.container}>
      {/* Allowed Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('listing.allowedItems')}</Text>
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('listing.allowedItemsHint')}</Text>

        <View style={styles.itemsGrid}>
          {ITEM_CATEGORIES.allowed.map((item) => {
            const isSelected = restrictions.allowed.includes(item.key);
            return (
              <Pressable
                key={item.key}
                onPress={() => toggleAllowed(item.key)}
                style={[
                  styles.itemChip,
                  {
                    backgroundColor: isSelected ? colors.success + '15' : colors.surface,
                    borderColor: isSelected ? colors.success : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={isSelected ? colors.success : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.itemLabel,
                    { color: isSelected ? colors.success : colors.text },
                  ]}
                >
                  {isArabic ? item.labelAr : item.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkIcon, { backgroundColor: colors.success }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Not Allowed Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="close-circle" size={20} color={colors.error} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('listing.notAllowedItems')}</Text>
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('listing.notAllowedItemsHint')}</Text>

        <View style={styles.itemsGrid}>
          {ITEM_CATEGORIES.notAllowed.map((item) => {
            const isSelected = restrictions.notAllowed.includes(item.key);
            return (
              <Pressable
                key={item.key}
                onPress={() => toggleNotAllowed(item.key)}
                style={[
                  styles.itemChip,
                  {
                    backgroundColor: isSelected ? colors.error + '15' : colors.surface,
                    borderColor: isSelected ? colors.error : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={isSelected ? colors.error : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.itemLabel,
                    { color: isSelected ? colors.error : colors.text },
                  ]}
                >
                  {isArabic ? item.labelAr : item.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkIcon, { backgroundColor: colors.error }]}>
                    <Ionicons name="close" size={10} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Additional Notes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('listing.additionalNotes')}</Text>
        </View>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('listing.additionalNotesHint')}</Text>

        <TextInput
          style={[
            styles.notesInput,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder={t('listing.notesPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          value={restrictions.notes || ''}
          onChangeText={updateNotes}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 28,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    position: 'relative',
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
  },
});
