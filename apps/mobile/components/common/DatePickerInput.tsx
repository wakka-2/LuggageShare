import { useState } from 'react';
import i18n from '@/i18n';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, themed } from '@/providers/ThemeProvider';
import { CalendarModal } from './CalendarModal';

interface DatePickerInputProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  placeholderColor?: string;
  textAlign?: 'left' | 'right';
}

export function DatePickerInput({
  value,
  onChange,
  placeholder,
  minimumDate,
  textColor = V2_COLORS.text,
  backgroundColor = V2_COLORS.surface,
  placeholderColor = V2_COLORS.textMuted,
  textAlign,
}: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  const formatDate = (date: Date) => {
    // Readable, localized date. Arabic uses the Gregorian calendar and Western
    // digits to match the rest of the app (ar-SA defaults to Hijri).
    const locale = i18n.language === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB';
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setShow(true)} style={[styles.input, { backgroundColor }]}>
        <Text
          style={[
            styles.inputText,
            { textAlign: textAlign ?? (i18n.language === 'ar' ? 'right' : 'left') },
            value ? { color: textColor } : { color: placeholderColor },
          ]}
        >
          {value ? formatDate(value) : (placeholder ?? i18n.t('common.selectDate'))}
        </Text>
      </TouchableOpacity>

      <CalendarModal
        visible={show}
        value={value}
        minimumDate={minimumDate}
        onSelect={onChange}
        onClose={() => setShow(false)}
      />
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    input: {
      height: 48,
      borderRadius: RADIUS.input,
      paddingHorizontal: 20,
      justifyContent: 'center',
      ...BUBBLE_SHADOWS.xs,
    },
    inputText: {
      fontSize: 16,
    },
  })
);
