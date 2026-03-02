import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useListing } from '@/hooks/useListings';
import { useCreateBooking, BookingItemParam } from '@/hooks/useBookings';
import { useImageUpload } from '@/hooks/useImageUpload';
import { validateWeight } from '@luggageshare/shared';
import { MOCK_LISTINGS, adaptMockListing } from '@/components/listings';
import { showAlert } from '@/lib/alert';

interface ItemDraft {
  name: string;
  description: string;
  weight: string;
  value: string;
  imageUrls: string[];
}

const EMPTY_ITEM: ItemDraft = { name: '', description: '', weight: '', value: '', imageUrls: [] };

export default function CreateBookingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: apiListing, isLoading: listingLoading } = useListing(listingId ?? null);
  const createBooking = useCreateBooking();
  const imageUpload = useImageUpload();

  // Fall back to mock data when the API doesn't return a result
  const mockMatch =
    !apiListing && listingId ? MOCK_LISTINGS.find((m) => m.id === listingId) : undefined;
  const listing = apiListing ?? (mockMatch ? adaptMockListing(mockMatch) : undefined);

  const [items, setItems] = useState<ItemDraft[]>([{ ...EMPTY_ITEM }]);

  const listingPrice = listing ? Number(listing.price) || 0 : 0;

  // Compute total weight from items
  const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);

  const updateItem = (index: number, field: keyof ItemDraft, value: string | string[]) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImage = async (itemIndex: number) => {
    const url = await imageUpload.pickAndUpload({ folder: 'items' });
    if (url) {
      setItems((prev) =>
        prev.map((item, i) =>
          i === itemIndex ? { ...item, imageUrls: [...item.imageUrls, url] } : item
        )
      );
    }
  };

  const handleRemoveImage = (itemIndex: number, imgIndex: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === itemIndex
          ? { ...item, imageUrls: item.imageUrls.filter((_, j) => j !== imgIndex) }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    if (!listingId) {
      showAlert(t('common.errorTitle'), 'Missing listing ID');
      return;
    }

    // Validate all items have a name and weight
    for (const item of items) {
      if (!item.name.trim()) {
        showAlert(t('common.errorTitle'), t('booking.itemNameRequired'));
        return;
      }
      if (!item.weight || parseFloat(item.weight) <= 0) {
        showAlert(t('common.errorTitle'), t('booking.itemWeightRequired'));
        return;
      }
    }

    if (totalWeight <= 0) {
      showAlert(t('common.errorTitle'), t('booking.pleaseEnterWeight'));
      return;
    }

    const weightCheck = validateWeight(totalWeight);
    if (!weightCheck.valid) {
      showAlert(t('common.errorTitle'), weightCheck.error!);
      return;
    }

    const availableWeight = listing ? Number(listing.availableWeight) || 0 : 0;
    if (listing && availableWeight > 0 && totalWeight > availableWeight) {
      showAlert(
        t('common.errorTitle'),
        `Weight (${totalWeight}kg) exceeds available (${availableWeight}kg)`
      );
      return;
    }

    try {
      const bookingItems: BookingItemParam[] = items.map((item) => ({
        name: item.name.trim(),
        description: item.description.trim() || undefined,
        weight: parseFloat(item.weight),
        value: parseFloat(item.value) || 0,
        imageUrls: item.imageUrls.length > 0 ? item.imageUrls : undefined,
      }));

      await createBooking.mutateAsync({
        listingId,
        totalWeight,
        items: bookingItems,
      });

      showAlert(t('booking.bookingSent'), t('booking.bookingSentMessage'), () =>
        router.replace('/(tabs)/trips')
      );
    } catch (error: any) {
      const apiMsg = error?.response?.data?.message;
      showAlert(t('common.errorTitle'), apiMsg || t('booking.failedToSend'));
    }
  };

  if (listingLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
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
            <Ionicons
              name="airplane"
              size={18}
              color={colors.primary}
              style={{ marginHorizontal: 10 }}
            />
            <Text style={[styles.city, { color: colors.text }]}>{listing.arrivalCity}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {new Date(listing.departureDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            {listingPrice} {listing.currency || 'SAR'}
          </Text>
        </View>

        {/* Items Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('booking.items')}</Text>
          <Text style={[styles.sectionHint, { color: colors.textSecondary }]}>
            {t('booking.addItemsHint')}
          </Text>
        </View>

        {items.map((item, index) => (
          <View key={index} style={[styles.itemCard, { backgroundColor: colors.card }]}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemNumber, { color: colors.primary }]}>
                {t('booking.itemNumber', { number: index + 1 })}
              </Text>
              {items.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeItem(index)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>

            {/* Item Name */}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={item.name}
              onChangeText={(v) => updateItem(index, 'name', v)}
              placeholder={t('booking.itemNamePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              textAlign={isRTL ? 'right' : 'left'}
            />

            {/* Weight & Value Row */}
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {t('booking.weight')} (kg) *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={item.weight}
                  onChangeText={(v) => updateItem(index, 'weight', v)}
                  placeholder="0.0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  {t('booking.itemValue')} (SAR)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={item.value}
                  onChangeText={(v) => updateItem(index, 'value', v)}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  textAlign={isRTL ? 'right' : 'left'}
                />
              </View>
            </View>

            {/* Description */}
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={item.description}
              onChangeText={(v) => updateItem(index, 'description', v)}
              placeholder={t('booking.itemDescriptionPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
              textAlign={isRTL ? 'right' : 'left'}
              textAlignVertical="top"
            />

            {/* Item Images */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 8 }]}>
              {t('booking.itemPhotos')}
            </Text>
            <View style={styles.imageRow}>
              {item.imageUrls.map((url, imgIdx) => (
                <View key={imgIdx} style={styles.imageWrapper}>
                  <Image source={{ uri: url }} style={styles.itemImage} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => handleRemoveImage(index, imgIdx)}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              {item.imageUrls.length < 3 && (
                <TouchableOpacity
                  style={[
                    styles.addImageBtn,
                    { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
                  ]}
                  onPress={() => handleAddImage(index)}
                  disabled={imageUpload.isUploading}
                >
                  {imageUpload.isUploading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={28} color={colors.primary} />
                      <Text style={[styles.addImageText, { color: colors.primary }]}>
                        {t('booking.addPhoto')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Add Another Item */}
        <TouchableOpacity
          style={[styles.addItemBtn, { borderColor: colors.primary }]}
          onPress={addItem}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.addItemText, { color: colors.primary }]}>
            {t('booking.addAnotherItem')}
          </Text>
        </TouchableOpacity>

        {/* Price Summary */}
        {totalWeight > 0 && (
          <View style={[styles.priceCard, { backgroundColor: colors.card }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                {t('booking.weight')}
              </Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>
                {totalWeight.toFixed(1)} kg
              </Text>
            </View>
            <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />
            <View style={styles.priceRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>{t('booking.total')}</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {listingPrice} {listing.currency || 'SAR'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createBooking.isPending}
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primary, opacity: createBooking.isPending ? 0.7 : 1 },
          ]}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  } as ViewStyle,
  headerBtn: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,
  summaryCard: { borderRadius: 16, padding: 20, marginBottom: 24 } as ViewStyle,
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 } as ViewStyle,
  city: { fontSize: 18, fontWeight: '700' } as TextStyle,
  dateText: { fontSize: 14, marginBottom: 4 } as TextStyle,
  priceText: { fontSize: 16, fontWeight: '700', marginTop: 4 } as TextStyle,

  sectionHeader: { marginBottom: 12 } as ViewStyle,
  sectionTitle: { fontSize: 16, fontWeight: '700' } as TextStyle,
  sectionHint: { fontSize: 13, marginTop: 2 } as TextStyle,

  itemCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  } as ViewStyle,
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,
  itemNumber: { fontSize: 14, fontWeight: '700' } as TextStyle,

  input: {
    height: 46,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 8,
  } as TextStyle,
  multilineInput: {
    height: 60,
    paddingVertical: 10,
  } as TextStyle,
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 } as TextStyle,
  rowInputs: { flexDirection: 'row', gap: 10 } as ViewStyle,
  halfInput: { flex: 1 } as ViewStyle,

  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
    marginBottom: 4,
  } as ViewStyle,
  imageWrapper: { position: 'relative' } as ViewStyle,
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  } as ImageStyle,
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 10,
  } as ViewStyle,
  addImageBtn: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  } as ViewStyle,
  addImageText: { fontSize: 11, fontWeight: '600' } as TextStyle,

  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 24,
  } as ViewStyle,
  addItemText: { fontSize: 14, fontWeight: '600' } as TextStyle,

  priceCard: { borderRadius: 16, padding: 20, marginBottom: 16 } as ViewStyle,
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 } as ViewStyle,
  priceLabel: { fontSize: 14 } as TextStyle,
  priceValue: { fontSize: 14, fontWeight: '500' } as TextStyle,
  priceDivider: { height: 1, marginVertical: 8 } as ViewStyle,
  totalLabel: { fontSize: 16, fontWeight: '700' } as TextStyle,
  totalValue: { fontSize: 20, fontWeight: '700' } as TextStyle,
  bottomBar: { padding: 16, borderTopWidth: 1 } as ViewStyle,
  submitBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
