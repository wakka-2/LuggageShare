import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, I18nManager, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, BUBBLE_SHADOWS, V2_COLORS } from '@/providers/ThemeProvider';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface BubbleInputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  dotColor?: string;
  icon?: IoniconsName;
  error?: string;
  multiline?: boolean;
  editable?: boolean;
}

export function BubbleInput({
  value,
  onChangeText,
  placeholder,
  dotColor,
  icon,
  error,
  multiline = false,
  editable = true,
  ...rest
}: BubbleInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isRTL = I18nManager.isRTL;

  const indicator = dotColor ? (
    <View style={[styles.dot, { backgroundColor: dotColor }]} />
  ) : icon ? (
    <Ionicons name={icon} size={18} color={V2_COLORS.textSoft} />
  ) : null;

  return (
    <View>
      <View
        style={[
          styles.container,
          BUBBLE_SHADOWS.xs,
          multiline && styles.multiline,
          isFocused && styles.focused,
          error && styles.errorBorder,
          !editable && styles.readOnly,
        ]}
      >
        {indicator && (
          <View style={[styles.indicatorWrap, isRTL && styles.indicatorRTL]}>{indicator}</View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={V2_COLORS.textMuted}
          multiline={multiline}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, multiline && styles.inputMultiline, isRTL && styles.inputRTL]}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.input,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  multiline: {
    borderRadius: RADIUS.card,
    alignItems: 'flex-start',
    minHeight: 100,
    paddingVertical: 16,
  },
  focused: {
    borderColor: V2_COLORS.primary,
  },
  errorBorder: {
    borderColor: V2_COLORS.secondary,
  },
  readOnly: {
    opacity: 0.6,
  },
  indicatorWrap: {
    marginRight: 10,
  },
  indicatorRTL: {
    marginRight: 0,
    marginLeft: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: V2_COLORS.text,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 60,
  },
  inputRTL: {
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    color: V2_COLORS.secondary,
    marginTop: 6,
    marginLeft: 16,
    fontWeight: '500',
  },
});
