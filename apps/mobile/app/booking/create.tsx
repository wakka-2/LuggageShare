import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useListing } from '@/hooks/useListings';
import { useCreateBooking } from '@/hooks/useBookings';

export default function CreateBookingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: listing, isLoading: listingLoading } = useListing(listingId ?? null);
  const createBooking = useCreateBooking();

  const [weight, setWeight] = useState('');

  const pricePerKg = listing ? Number(listing.pricePerKg) : 0;
  const totalPrice = weight ? parseFloat(weight) * pricePerKg : 0;

  const handleSubmit = async () => {
    if (!weight || !listingId) {
      Alert.alert(t('common.errorTitle'), t('booking.pleaseEnterWeight'));
      return;
    }

    try {
      await createBooking.mutateAsync({
        listingId,
        totalWeight: parseFloat(weight),
        totalPrice,
        currency: listing?.currency || 'SAR',
      });

      Alert.alert(
        t('booking.bookingSent'),
        t('booking.bookingSentMessage'),
        [{ text: t('common.ok'), onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t('common.errorTitle'), t('booking.failedToSend'));
    }
  };

  if (listingLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={{ color: colors.textSecondary }}>{t('listing.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('booking.bookListing')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Listing Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.routeRow}>
            <Text style={[styles.city, { color: colors.text }]}>{listing.departureCity}</Text>
            <Ionicons name="airplane" size={18} color={colors.primary} style={{ marginHorizontal: 10 }} />
            <Text style={[styles.city, { color: colors.text }]}>{listing.arrivalCity}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {new Date(listing.departureDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {pricePerKg} {listing.currency} / kg
          </Text>
        </View>

        {/* Weight Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t('booking.weightNeeded')} <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={weight}
            onChangeText={setWeight}
            placeholder={`${t('booking.maxWeight')}: ${Number(listing.availableWeight)} kg`}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        {/* Price Summary */}
        {weight && parseFloat(weight) > 0 && (
          <View style={[styles.priceCard, { backgroundColor: colors.card }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>{t('booking.weight')}</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{weight} kg</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>{t('booking.rate')}</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{pricePerKg} {listing.currency}/kg</Text>
            </View>
            <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />
            <View style={styles.priceRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>{t('booking.total')}</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>{totalPrice.toFixed(2)} {listing.currency}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createBooking.isPending}
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: createBooking.isPending ? 0.7 : 1 }]}
        >
          {createBooking.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>{t('booking.sendRequest')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 } as ViewStyle,
  headerBtn: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,
  summaryCard: { borderRadius: 16, padding: 20, marginBottom: 24 } as ViewStyle,
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 } as ViewStyle,
  city: { fontSize: 18, fontWeight: '700' } as TextStyle,
  dateText: { fontSize: 14, marginBottom: 4 } as TextStyle,
  priceText: { fontSize: 16, fontWeight: '700', marginTop: 4 } as TextStyle,
  inputGroup: { marginBottom: 24 } as ViewStyle,
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 } as TextStyle,
  input: { height: 52, borderRadius: 12, paddingHorizontal: 16, fontSize: 18, borderWidth: 1, fontWeight: '600' } as ViewStyle,
  priceCard: { borderRadius: 16, padding: 20 } as ViewStyle,
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 } as ViewStyle,
  priceLabel: { fontSize: 14 } as TextStyle,
  priceValue: { fontSize: 14, fontWeight: '500' } as TextStyle,
  priceDivider: { height: 1, marginVertical: 8 } as ViewStyle,
  totalLabel: { fontSize: 16, fontWeight: '700' } as TextStyle,
  totalValue: { fontSize: 20, fontWeight: '700' } as TextStyle,
  bottomBar: { padding: 16, borderTopWidth: 1 } as ViewStyle,
  submitBtn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
