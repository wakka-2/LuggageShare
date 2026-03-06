import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import type { StepProps } from '../WizardContainer';

const PROHIBITED_ITEMS = [
  'Explosives & flammables',
  'Illegal drugs & narcotics',
  'Weapons & ammunition',
  'Hazardous chemicals',
  'Counterfeit goods',
  'Restricted electronics',
];

export function ProhibitedItemsStep({ data, updateData, goNext }: StepProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const isDeclared = data.prohibitedItemsDeclared === true;

  return (
    <View>
      <QuestionTitle
        emoji="⚠️"
        title={t('requestWizard.prohibited.title', {
          defaultValue: 'Prohibited items declaration',
        })}
      />

      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.warningBox}>
        <View style={[styles.warningHeader, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="warning-outline" size={20} color="#92400E" />
          <Text style={[styles.warningTitle, { color: '#92400E' }]}>
            {t('requestWizard.prohibited.warningTitle', {
              defaultValue: 'Items you CANNOT send',
            })}
          </Text>
        </View>
        <View
          style={[styles.warningBody, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {PROHIBITED_ITEMS.map((item, i) => (
            <View key={i} style={styles.prohibitedItem}>
              <Ionicons name="close-circle" size={16} color="#EF4444" />
              <Text style={[styles.prohibitedText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).springify()}>
        <TouchableOpacity
          onPress={() => updateData({ prohibitedItemsDeclared: !isDeclared })}
          style={[styles.checkbox, { borderColor: isDeclared ? colors.primary : colors.border }]}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.checkboxBox,
              {
                backgroundColor: isDeclared ? colors.primary : 'transparent',
                borderColor: isDeclared ? colors.primary : colors.border,
              },
            ]}
          >
            {isDeclared && <Ionicons name="checkmark" size={16} color="#FFF" />}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            {t('requestWizard.prohibited.declaration', {
              defaultValue: 'I confirm my items do not include any prohibited items listed above',
            })}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {isDeclared && (
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.nextContainer}>
          <AnimatedButton
            title={t('wizard.next', { defaultValue: 'Next' })}
            onPress={goNext}
            size="lg"
            fullWidth
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  warningBox: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  warningBody: {
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  prohibitedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prohibitedText: {
    fontSize: 14,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  nextContainer: {
    marginTop: 16,
  },
});
