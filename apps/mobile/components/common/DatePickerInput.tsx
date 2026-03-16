import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';

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
  placeholder = 'Select date',
  minimumDate,
  textColor = V2_COLORS.text,
  backgroundColor = '#FFFFFF',
  placeholderColor = V2_COLORS.textMuted,
  textAlign = 'left',
}: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setShow(true)} style={[styles.input, { backgroundColor }]}>
        <Text
          style={[
            styles.inputText,
            { textAlign },
            value ? { color: textColor } : { color: placeholderColor },
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
