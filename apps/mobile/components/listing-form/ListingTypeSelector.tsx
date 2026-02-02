import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ListingType } from '@/components/listings/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ListingTypeSelectorProps {
  value: ListingType;
  onChange: (type: ListingType) => void;
}

export function ListingTypeSelector({ value, onChange }: ListingTypeSelectorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const types: { type: ListingType; icon: keyof typeof Ionicons.glyphMap; title: string; description: string }[] = [
    {
      type: 'offer',
      icon: 'airplane-outline',
      title: t('listing.typeOffer'),
      description: t('listing.typeOfferDesc'),
    },
    {
      type: 'request',
      icon: 'cube-outline',
      title: t('listing.typeRequest'),
      description: t('listing.typeRequestDesc'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t('listing.selectType')}</Text>
      <View style={styles.options}>
        {types.map((item, index) => {
          const isSelected = value === item.type;
          return (
            <AnimatedPressable
              key={item.type}
              entering={FadeIn.delay(index * 100)}
              onPress={() => onChange(item.type)}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? colors.primary + '15' : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.textSecondary + '20',
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={28}
                  color={isSelected ? '#fff' : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.title,
                  {
                    color: isSelected ? colors.primary : colors.text,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {item.title}
              </Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {item.description}
              </Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
