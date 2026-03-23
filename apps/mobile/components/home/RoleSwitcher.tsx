import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS } from '@/providers/ThemeProvider';

type UserRole = 'sender' | 'carrier';

interface RoleSwitcherProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleSwitcher({ activeRole, onRoleChange }: RoleSwitcherProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.roleButton, activeRole === 'sender' && styles.roleActive]}
        onPress={() => onRoleChange('sender')}
      >
        <Ionicons
          name="cube-outline"
          size={18}
          color={activeRole === 'sender' ? '#FFFFFF' : V2_COLORS.textSoft}
        />
        <Text
          style={[
            styles.roleText,
            { color: activeRole === 'sender' ? '#FFFFFF' : V2_COLORS.textSoft },
          ]}
        >
          {t('trips.asSender')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleButton, activeRole === 'carrier' && styles.roleActive]}
        onPress={() => onRoleChange('carrier')}
      >
        <Ionicons
          name="airplane-outline"
          size={18}
          color={activeRole === 'carrier' ? '#FFFFFF' : V2_COLORS.textSoft}
        />
        <Text
          style={[
            styles.roleText,
            { color: activeRole === 'carrier' ? '#FFFFFF' : V2_COLORS.textSoft },
          ]}
        >
          {t('trips.asCarrier')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.pill,
    padding: 4,
    ...BUBBLE_SHADOWS.sm,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  roleActive: {
    backgroundColor: V2_COLORS.primary,
    ...BUBBLE_SHADOWS.xs,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
