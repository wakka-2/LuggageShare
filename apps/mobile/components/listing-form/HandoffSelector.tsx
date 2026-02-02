import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { HandoffOption } from '@/components/listings/types';

interface HandoffSelectorProps {
  handoffOptions: HandoffOption[];
  onHandoffOptionsChange: (options: HandoffOption[]) => void;
}

type HandoffType = HandoffOption['type'];

interface HandoffTypeConfig {
  type: HandoffType;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  color: string;
}

const HANDOFF_TYPES: HandoffTypeConfig[] = [
  {
    type: 'home_pickup',
    icon: 'home-outline',
    title: 'Home Pickup',
    titleAr: 'استلام من المنزل',
    description: 'Pick up from your location',
    descriptionAr: 'استلام من موقعك',
    color: 'success',
  },
  {
    type: 'mall_meetup',
    icon: 'storefront-outline',
    title: 'Mall Meetup',
    titleAr: 'لقاء في المول',
    description: 'Meet at a shopping center',
    descriptionAr: 'لقاء في مركز تسوق',
    color: 'primary',
  },
  {
    type: 'airport_dropoff',
    icon: 'airplane-outline',
    title: 'Airport Drop-off',
    titleAr: 'تسليم في المطار',
    description: 'Meet at the airport',
    descriptionAr: 'لقاء في المطار',
    color: 'warning',
  },
  {
    type: 'custom',
    icon: 'location-outline',
    title: 'Custom Location',
    titleAr: 'موقع مخصص',
    description: 'Specify your own location',
    descriptionAr: 'حدد موقعك الخاص',
    color: 'textSecondary',
  },
];

export function HandoffSelector({ handoffOptions, onHandoffOptionsChange }: HandoffSelectorProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<HandoffType | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [locationInputAr, setLocationInputAr] = useState('');

  const getColorValue = (colorKey: string) => {
    return colors[colorKey as keyof typeof colors] || colors.primary;
  };

  const hasType = (type: HandoffType) => handoffOptions.some((o) => o.type === type);

  const openAddModal = (type: HandoffType) => {
    setSelectedType(type);
    setLocationInput('');
    setLocationInputAr('');
    setShowModal(true);
  };

  const addHandoffOption = () => {
    if (!selectedType || !locationInput.trim()) return;

    const newOption: HandoffOption = {
      type: selectedType,
      location: locationInput.trim(),
      locationAr: locationInputAr.trim() || locationInput.trim(),
    };

    onHandoffOptionsChange([...handoffOptions, newOption]);
    setShowModal(false);
    setSelectedType(null);
    setLocationInput('');
    setLocationInputAr('');
  };

  const removeHandoffOption = (index: number) => {
    const newOptions = handoffOptions.filter((_, i) => i !== index);
    onHandoffOptionsChange(newOptions);
  };

  const getTypeConfig = (type: HandoffType) => {
    return HANDOFF_TYPES.find((t) => t.type === type)!;
  };

  return (
    <Animated.View entering={FadeIn.delay(500)} style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t('listing.handoffOptions')}</Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('listing.handoffOptionsHint')}</Text>

      {/* Selected Handoff Options */}
      {handoffOptions.length > 0 && (
        <View style={styles.selectedOptions}>
          {handoffOptions.map((option, index) => {
            const config = getTypeConfig(option.type);
            const colorValue = getColorValue(config.color);
            return (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 50)}
                style={[
                  styles.selectedOption,
                  {
                    backgroundColor: colorValue + '10',
                    borderColor: colorValue,
                  },
                ]}
              >
                <View style={[styles.optionIcon, { backgroundColor: colorValue + '20' }]}>
                  <Ionicons name={config.icon} size={18} color={colorValue} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionType, { color: colorValue }]}>
                    {isArabic ? config.titleAr : config.title}
                  </Text>
                  <Text style={[styles.optionLocation, { color: colors.text }]} numberOfLines={1}>
                    {isArabic ? option.locationAr : option.location}
                  </Text>
                </View>
                <Pressable
                  onPress={() => removeHandoffOption(index)}
                  style={styles.removeButton}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={22} color={colors.error} />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Handoff Type Selection */}
      <View style={styles.typesGrid}>
        {HANDOFF_TYPES.map((type) => {
          const colorValue = getColorValue(type.color);
          const isAdded = hasType(type.type);
          return (
            <Pressable
              key={type.type}
              onPress={() => !isAdded && openAddModal(type.type)}
              style={[
                styles.typeCard,
                {
                  backgroundColor: isAdded ? colors.surface : colors.surface,
                  borderColor: isAdded ? colors.success : colors.border,
                  opacity: isAdded ? 0.6 : 1,
                },
              ]}
            >
              <View style={[styles.typeIcon, { backgroundColor: colorValue + '20' }]}>
                <Ionicons name={type.icon} size={24} color={colorValue} />
              </View>
              <Text style={[styles.typeTitle, { color: colors.text }]}>
                {isArabic ? type.titleAr : type.title}
              </Text>
              <Text style={[styles.typeDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {isArabic ? type.descriptionAr : type.description}
              </Text>
              {isAdded ? (
                <View style={[styles.addedBadge, { backgroundColor: colors.success }]}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              ) : (
                <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
                  <Ionicons name="add" size={16} color="#fff" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Add Location Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedType && (isArabic
                ? getTypeConfig(selectedType).titleAr
                : getTypeConfig(selectedType).title)}
            </Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t('listing.locationDetails')}
            </Text>
            <TextInput
              style={[
                styles.locationInput,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={t('listing.locationPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={locationInput}
              onChangeText={setLocationInput}
              autoFocus
            />

            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
              {t('listing.locationDetailsAr')} ({t('common.optional')})
            </Text>
            <TextInput
              style={[
                styles.locationInput,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={t('listing.locationPlaceholderAr')}
              placeholderTextColor={colors.textSecondary}
              value={locationInputAr}
              onChangeText={setLocationInputAr}
              textAlign="right"
            />

            <Pressable
              onPress={addHandoffOption}
              disabled={!locationInput.trim()}
              style={[
                styles.saveButton,
                {
                  backgroundColor: locationInput.trim() ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>{t('listing.addLocation')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    marginBottom: 16,
  },
  selectedOptions: {
    gap: 10,
    marginBottom: 16,
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionType: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionLocation: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '47%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
