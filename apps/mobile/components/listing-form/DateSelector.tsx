import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { format, addDays, addWeeks, isBefore, startOfDay } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface DateSelectorProps {
  date: Date | null;
  returnDate?: Date | null;
  onDateChange: (date: Date) => void;
  onReturnDateChange?: (date: Date | null) => void;
  showReturnDate?: boolean;
}

export function DateSelector({
  date,
  returnDate,
  onDateChange,
  onReturnDateChange,
  showReturnDate = false,
}: DateSelectorProps) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const locale = isArabic ? ar : enUS;

  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState<'travel' | 'return'>('travel');

  const today = startOfDay(new Date());
  const quickDates = [
    { label: t('listing.today'), date: today },
    { label: t('listing.tomorrow'), date: addDays(today, 1) },
    { label: t('listing.thisWeek'), date: addDays(today, 3) },
    { label: t('listing.nextWeek'), date: addWeeks(today, 1) },
  ];

  const formatDisplayDate = (d: Date | null) => {
    if (!d) return t('listing.selectDate');
    return format(d, 'EEEE, d MMMM yyyy', { locale });
  };

  const openPicker = (type: 'travel' | 'return') => {
    setPickerType(type);
    setShowPicker(true);
  };

  const selectDate = (selectedDate: Date) => {
    if (pickerType === 'travel') {
      onDateChange(selectedDate);
      // Reset return date if it's before travel date
      if (returnDate && isBefore(returnDate, selectedDate)) {
        onReturnDateChange?.(null);
      }
    } else {
      onReturnDateChange?.(selectedDate);
    }
    setShowPicker(false);
  };

  // Generate next 60 days for picker
  const generateDates = () => {
    const dates: Date[] = [];
    const startDate = pickerType === 'return' && date ? date : today;
    for (let i = 0; i < 60; i++) {
      dates.push(addDays(startDate, i));
    }
    return dates;
  };

  return (
    <Animated.View entering={FadeIn.delay(200)} style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t('listing.travelDate')}</Text>

      {/* Quick Date Selection */}
      <View style={styles.quickDates}>
        {quickDates.map((item, index) => {
          const isSelected = date && format(date, 'yyyy-MM-dd') === format(item.date, 'yyyy-MM-dd');
          return (
            <Pressable
              key={index}
              onPress={() => onDateChange(item.date)}
              style={[
                styles.quickDateChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.quickDateText,
                  { color: isSelected ? '#fff' : colors.text },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Travel Date Picker */}
      <Pressable
        onPress={() => openPicker('travel')}
        style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
        </View>
        <View style={styles.dateInfo}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
            {t('listing.departureDate')}
          </Text>
          <Text style={[styles.dateValue, { color: date ? colors.text : colors.textSecondary }]}>
            {formatDisplayDate(date)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </Pressable>

      {/* Return Date (optional) */}
      {showReturnDate && (
        <View style={styles.returnDateContainer}>
          <View style={styles.returnDateHeader}>
            <Text style={[styles.returnDateLabel, { color: colors.textSecondary }]}>
              {t('listing.returnTrip')}
            </Text>
            {returnDate && (
              <Pressable onPress={() => onReturnDateChange?.(null)}>
                <Text style={[styles.clearText, { color: colors.error }]}>{t('common.clear')}</Text>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => openPicker('return')}
            disabled={!date}
            style={[
              styles.dateButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: date ? 1 : 0.5,
              },
            ]}
          >
            <View style={[styles.iconWrapper, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="return-down-back" size={20} color={colors.success} />
            </View>
            <View style={styles.dateInfo}>
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                {t('listing.returnDate')}
              </Text>
              <Text style={[styles.dateValue, { color: returnDate ? colors.text : colors.textSecondary }]}>
                {returnDate ? formatDisplayDate(returnDate) : t('listing.optional')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      )}

      {/* Date Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {pickerType === 'travel' ? t('listing.selectDepartureDate') : t('listing.selectReturnDate')}
            </Text>
            <Pressable onPress={() => setShowPicker(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.calendarContainer}>
            {generateDates().map((d, index) => {
              const isToday = format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              const isSelected =
                (pickerType === 'travel' && date && format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) ||
                (pickerType === 'return' && returnDate && format(d, 'yyyy-MM-dd') === format(returnDate, 'yyyy-MM-dd'));

              return (
                <Pressable
                  key={index}
                  onPress={() => selectDate(d)}
                  style={[
                    styles.dateItem,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isToday ? colors.primary : colors.border,
                      borderWidth: isToday && !isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dateItemDay,
                      { color: isSelected ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {format(d, 'EEE', { locale })}
                  </Text>
                  <Text
                    style={[
                      styles.dateItemDate,
                      { color: isSelected ? '#fff' : colors.text },
                    ]}
                  >
                    {format(d, 'd', { locale })}
                  </Text>
                  <Text
                    style={[
                      styles.dateItemMonth,
                      { color: isSelected ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {format(d, 'MMM', { locale })}
                  </Text>
                </Pressable>
              );
            })}
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
    marginBottom: 12,
  },
  quickDates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  quickDateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickDateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateButton: {
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
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  returnDateContainer: {
    marginTop: 16,
  },
  returnDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  returnDateLabel: {
    fontSize: 14,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '500',
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
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
  },
  dateItem: {
    width: '18%',
    aspectRatio: 0.85,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  dateItemDay: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateItemDate: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateItemMonth: {
    fontSize: 11,
    marginTop: 2,
  },
});
