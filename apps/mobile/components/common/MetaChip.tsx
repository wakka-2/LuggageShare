import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, V2_COLORS } from '@/providers/ThemeProvider';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface MetaChipProps {
  icon?: IoniconsName;
  label: string;
  color?: string;
  bold?: boolean;
}

export function MetaChip({ icon, label, color, bold = false }: MetaChipProps) {
  const bgColor = color ? color + '12' : V2_COLORS.bg;
  const textColor = color || V2_COLORS.textSoft;

  return (
    <View style={[styles.chip, { backgroundColor: bgColor }]}>
      {icon && <Ionicons name={icon} size={13} color={textColor} style={styles.icon} />}
      <Text style={[styles.label, { color: textColor }, bold && styles.bold]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
});
