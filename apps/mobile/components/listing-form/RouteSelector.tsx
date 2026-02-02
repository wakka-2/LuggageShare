import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface City {
  code: string;
  city: string;
  cityAr: string;
  country: string;
  countryAr: string;
}

const CITIES: City[] = [
  { code: 'RUH', city: 'Riyadh', cityAr: 'الرياض', country: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'JED', city: 'Jeddah', cityAr: 'جدة', country: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'DMM', city: 'Dammam', cityAr: 'الدمام', country: 'Saudi Arabia', countryAr: 'السعودية' },
  { code: 'DXB', city: 'Dubai', cityAr: 'دبي', country: 'UAE', countryAr: 'الإمارات' },
  { code: 'AUH', city: 'Abu Dhabi', cityAr: 'أبوظبي', country: 'UAE', countryAr: 'الإمارات' },
  { code: 'DOH', city: 'Doha', cityAr: 'الدوحة', country: 'Qatar', countryAr: 'قطر' },
  { code: 'KWI', city: 'Kuwait City', cityAr: 'الكويت', country: 'Kuwait', countryAr: 'الكويت' },
  { code: 'BAH', city: 'Manama', cityAr: 'المنامة', country: 'Bahrain', countryAr: 'البحرين' },
  { code: 'MCT', city: 'Muscat', cityAr: 'مسقط', country: 'Oman', countryAr: 'عمان' },
  { code: 'AMM', city: 'Amman', cityAr: 'عمان', country: 'Jordan', countryAr: 'الأردن' },
  { code: 'CAI', city: 'Cairo', cityAr: 'القاهرة', country: 'Egypt', countryAr: 'مصر' },
  { code: 'IST', city: 'Istanbul', cityAr: 'إسطنبول', country: 'Turkey', countryAr: 'تركيا' },
  { code: 'BEY', city: 'Beirut', cityAr: 'بيروت', country: 'Lebanon', countryAr: 'لبنان' },
  { code: 'LHR', city: 'London', cityAr: 'لندن', country: 'UK', countryAr: 'بريطانيا' },
  { code: 'CDG', city: 'Paris', cityAr: 'باريس', country: 'France', countryAr: 'فرنسا' },
];

interface RouteSelectorProps {
  from: City | null;
  to: City | null;
  onFromChange: (city: City) => void;
  onToChange: (city: City) => void;
}

export function RouteSelector({ from, to, onFromChange, onToChange }: RouteSelectorProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'from' | 'to'>('from');
  const [searchQuery, setSearchQuery] = useState('');

  const openModal = (type: 'from' | 'to') => {
    setModalType(type);
    setSearchQuery('');
    setModalVisible(true);
  };

  const selectCity = (city: City) => {
    if (modalType === 'from') {
      onFromChange(city);
    } else {
      onToChange(city);
    }
    setModalVisible(false);
  };

  const swapCities = () => {
    if (from && to) {
      onFromChange(to);
      onToChange(from);
    }
  };

  const filteredCities = CITIES.filter((city) => {
    const query = searchQuery.toLowerCase();
    return (
      city.city.toLowerCase().includes(query) ||
      city.cityAr.includes(searchQuery) ||
      city.country.toLowerCase().includes(query) ||
      city.code.toLowerCase().includes(query)
    );
  });

  const getCityDisplay = (city: City | null, placeholder: string) => {
    if (!city) return placeholder;
    return isArabic ? city.cityAr : city.city;
  };

  const getCountryDisplay = (city: City) => {
    return isArabic ? city.countryAr : city.country;
  };

  return (
    <Animated.View entering={FadeIn.delay(100)} style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t('listing.route')}</Text>

      <View style={styles.routeContainer}>
        {/* From */}
        <Pressable
          onPress={() => openModal('from')}
          style={[styles.cityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.iconWrapper, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="location" size={20} color={colors.success} />
          </View>
          <View style={styles.cityInfo}>
            <Text style={[styles.cityLabel, { color: colors.textSecondary }]}>{t('listing.from')}</Text>
            <Text
              style={[
                styles.cityName,
                { color: from ? colors.text : colors.textSecondary }
              ]}
              numberOfLines={1}
            >
              {getCityDisplay(from, t('listing.selectCity'))}
            </Text>
            {from && <Text style={[styles.cityCode, { color: colors.textSecondary }]}>{from.code}</Text>}
          </View>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Swap Button */}
        <Pressable
          onPress={swapCities}
          style={[styles.swapButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="swap-vertical" size={20} color="#fff" />
        </Pressable>

        {/* To */}
        <Pressable
          onPress={() => openModal('to')}
          style={[styles.cityButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.iconWrapper, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="location" size={20} color={colors.error} />
          </View>
          <View style={styles.cityInfo}>
            <Text style={[styles.cityLabel, { color: colors.textSecondary }]}>{t('listing.to')}</Text>
            <Text
              style={[
                styles.cityName,
                { color: to ? colors.text : colors.textSecondary }
              ]}
              numberOfLines={1}
            >
              {getCityDisplay(to, t('listing.selectCity'))}
            </Text>
            {to && <Text style={[styles.cityCode, { color: colors.textSecondary }]}>{to.code}</Text>}
          </View>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* City Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modalType === 'from' ? t('listing.selectFrom') : t('listing.selectTo')}
            </Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('listing.searchCity')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item.code}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
                <Pressable
                  onPress={() => selectCity(item)}
                  style={[
                    styles.cityItem,
                    { borderBottomColor: colors.border },
                    (modalType === 'from' && from?.code === item.code) ||
                    (modalType === 'to' && to?.code === item.code)
                      ? { backgroundColor: colors.primary + '10' }
                      : {},
                  ]}
                >
                  <View>
                    <Text style={[styles.cityItemName, { color: colors.text }]}>
                      {isArabic ? item.cityAr : item.city}
                    </Text>
                    <Text style={[styles.cityItemCountry, { color: colors.textSecondary }]}>
                      {getCountryDisplay(item)}
                    </Text>
                  </View>
                  <Text style={[styles.cityItemCode, { color: colors.primary }]}>{item.code}</Text>
                </Pressable>
              </Animated.View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </Modal>
    </Animated.View>
  );
}

export type { City };

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  routeContainer: {
    gap: 12,
  },
  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityInfo: {
    flex: 1,
  },
  cityLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cityCode: {
    fontSize: 12,
    marginTop: 2,
  },
  swapButton: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -6,
    zIndex: 1,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  cityItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cityItemCountry: {
    fontSize: 13,
    marginTop: 2,
  },
  cityItemCode: {
    fontSize: 14,
    fontWeight: '700',
  },
});
