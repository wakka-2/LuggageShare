import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useCreateListing } from '@/hooks/useListings';

export default function CreateListingScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const createListing = useCreateListing();

  const [departureCity, setDepartureCity] = useState('');
  const [departureCode, setDepartureCode] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [arrivalCode, setArrivalCode] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [availableWeight, setAvailableWeight] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!departureCity || !arrivalCity || !departureDate || !availableWeight || !pricePerKg) {
      Alert.alert(
        t('common.errorTitle'),
        t('common.requiredFieldsError')
      );
      return;
    }

    try {
      await createListing.mutateAsync({
        departureCity,
        departureCode: departureCode || undefined,
        arrivalCity,
        arrivalCode: arrivalCode || undefined,
        departureDate: new Date(departureDate).toISOString(),
        flightNumber: flightNumber || undefined,
        availableWeight: parseFloat(availableWeight),
        pricePerKg: parseFloat(pricePerKg),
        notes: notes || undefined,
      });

      Alert.alert(
        t('common.success'),
        t('listing.createdSuccess'),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        t('common.errorTitle'),
        t('listing.failedCreate')
      );
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options?: { placeholder?: string; keyboardType?: 'default' | 'numeric'; required?: boolean; multiline?: boolean }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label} {options?.required && <Text style={{ color: '#EF4444' }}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
          options?.multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={options?.placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={options?.keyboardType || 'default'}
        multiline={options?.multiline}
        textAlign={isRTL ? 'right' : 'left'}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t('listing.create')}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Route Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('listing.tripInfo')}
        </Text>

        <View style={styles.row}>
          <View style={styles.flex1}>
            {renderInput(t('listing.fromCity'), departureCity, setDepartureCity, {
              placeholder: t('listing.placeholderRiyadh'), required: true,
            })}
          </View>
          <View style={styles.codeInput}>
            {renderInput(t('listing.code'), departureCode, setDepartureCode, {
              placeholder: 'RUH',
            })}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex1}>
            {renderInput(t('listing.toCity'), arrivalCity, setArrivalCity, {
              placeholder: t('listing.placeholderCairo'), required: true,
            })}
          </View>
          <View style={styles.codeInput}>
            {renderInput(t('listing.code'), arrivalCode, setArrivalCode, {
              placeholder: 'CAI',
            })}
          </View>
        </View>

        {renderInput(t('listing.departureDate'), departureDate, setDepartureDate, {
          placeholder: '2026-03-15', required: true,
        })}

        {renderInput(t('listing.flightNumber'), flightNumber, setFlightNumber, {
          placeholder: 'SV123',
        })}

        {/* Weight & Price */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          {t('listing.weightAndPrice')}
        </Text>

        <View style={styles.row}>
          <View style={styles.flex1}>
            {renderInput(t('listing.availableWeightKg'), availableWeight, setAvailableWeight, {
              placeholder: '10', keyboardType: 'numeric', required: true,
            })}
          </View>
          <View style={styles.flex1}>
            {renderInput(t('listing.pricePerKgSar'), pricePerKg, setPricePerKg, {
              placeholder: '25', keyboardType: 'numeric', required: true,
            })}
          </View>
        </View>

        {/* Notes */}
        {renderInput(t('listing.notes'), notes, setNotes, {
          placeholder: t('listing.placeholderNotes'),
          multiline: true,
        })}
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.submitBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createListing.isPending}
          style={[styles.submitButton, { backgroundColor: colors.primary, opacity: createListing.isPending ? 0.7 : 1 }]}
        >
          {createListing.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {t('listing.postListing')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 } as ViewStyle,
  headerButton: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 } as TextStyle,
  row: { flexDirection: 'row', gap: 12 } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  codeInput: { width: 80 } as ViewStyle,
  inputGroup: { marginBottom: 16 } as ViewStyle,
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 } as TextStyle,
  input: { height: 48, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1 } as ViewStyle,
  multilineInput: { height: 100, paddingTop: 12, textAlignVertical: 'top' } as ViewStyle,
  submitBar: { padding: 16, borderTopWidth: 1 } as ViewStyle,
  submitButton: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
