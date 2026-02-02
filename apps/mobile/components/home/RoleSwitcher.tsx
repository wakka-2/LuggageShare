import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';

type UserRole = 'sender' | 'carrier';

interface RoleSwitcherProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleSwitcher({ activeRole, onRoleChange }: RoleSwitcherProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[
          styles.roleButton,
          activeRole === 'sender' && { backgroundColor: colors.primary },
        ]}
        onPress={() => onRoleChange('sender')}
      >
        <Ionicons
          name="cube-outline"
          size={18}
          color={activeRole === 'sender' ? '#FFFFFF' : colors.textSecondary}
        />
        <Text
          style={[
            styles.roleText,
            { color: activeRole === 'sender' ? '#FFFFFF' : colors.textSecondary },
          ]}
        >
          {t('trips.asSender')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.roleButton,
          activeRole === 'carrier' && { backgroundColor: colors.primary },
        ]}
        onPress={() => onRoleChange('carrier')}
      >
        <Ionicons
          name="airplane-outline"
          size={18}
          color={activeRole === 'carrier' ? '#FFFFFF' : colors.textSecondary}
        />
        <Text
          style={[
            styles.roleText,
            { color: activeRole === 'carrier' ? '#FFFFFF' : colors.textSecondary },
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
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
