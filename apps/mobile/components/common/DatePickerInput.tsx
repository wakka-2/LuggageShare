import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';

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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
};

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'Select date',
  minimumDate,
  textColor = '#000',
  backgroundColor = '#FFF',
  borderColor = '#E5E7EB',
  placeholderColor = '#9CA3AF',
  textAlign = 'left',
}: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  // Web: use native HTML date input
  if (Platform.OS === 'web') {
    return (
      <View>
        <input
          type="date"
          value={value ? formatDate(value) : ''}
          min={minimumDate ? formatDate(minimumDate) : undefined}
          onChange={(e) => {
            const d = new Date(e.target.value + 'T00:00:00');
            if (!isNaN(d.getTime())) onChange(d);
          }}
          placeholder={placeholder}
          style={{
            height: 48,
            borderRadius: 12,
            paddingLeft: 16,
            paddingRight: 16,
            fontSize: 16,
            border: `1px solid ${borderColor}`,
            backgroundColor,
            color: value ? textColor : placeholderColor,
            textAlign,
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box' as const,
            cursor: 'pointer',
          }}
        />
      </View>
    );
  }

  // Native: lazy-load the native picker to avoid web bundling issues
  const DateTimePicker = require('@react-native-community/datetimepicker').default;

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={[styles.input, { backgroundColor, borderColor }]}
      >
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
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
  },
  inputText: {
    fontSize: 16,
  },
});
