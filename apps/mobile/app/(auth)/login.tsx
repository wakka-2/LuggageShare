import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAppleAuth } from '@/hooks/useAppleAuth';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();
  const { signInWithApple, isLoading: isAppleLoading } = useAppleAuth();

  const isLoading = isGoogleLoading || isAppleLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Ionicons name="briefcase" size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            LuggageShare
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            {t('auth.tagline')}
          </Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.authButtons}>
          {/* Google Sign In */}
          <TouchableOpacity
            style={[styles.authButton, styles.googleButton]}
            onPress={signInWithGoogle}
            disabled={isLoading}
          >
            <Image
              source={require('@/assets/images/google-icon.png')}
              style={styles.authIcon}
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>
              {t('auth.continueWithGoogle')}
            </Text>
          </TouchableOpacity>

          {/* Apple Sign In */}
          <TouchableOpacity
            style={[styles.authButton, styles.appleButton]}
            onPress={signInWithApple}
            disabled={isLoading}
          >
            <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
            <Text style={styles.appleButtonText}>
              {t('auth.continueWithApple')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View style={styles.terms}>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            {t('auth.termsPrefix')}{' '}
            <Text style={[styles.termsLink, { color: colors.primary }]}>
              {t('auth.termsOfService')}
            </Text>
            {' '}{t('auth.and')}{' '}
            <Text style={[styles.termsLink, { color: colors.primary }]}>
              {t('auth.privacyPolicy')}
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  authButtons: {
    gap: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authIcon: {
    width: 24,
    height: 24,
  },
  terms: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
  },
});
