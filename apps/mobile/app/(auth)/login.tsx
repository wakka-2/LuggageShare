import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAppleAuth } from '@/hooks/useAppleAuth';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();
  const { signInWithApple, isLoading: isAppleLoading } = useAppleAuth();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isDevLoading, setIsDevLoading] = useState(false);

  const isLoading = isGoogleLoading || isAppleLoading || isDevLoading;

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
      Alert.alert(t('common.error'), message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setError(null);
      await signInWithApple();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
      Alert.alert(t('common.error'), message);
    }
  };

  const handleDevLogin = async () => {
    try {
      setError(null);
      setIsDevLoading(true);
      const { data } = await apiClient.post('/auth/dev-login');
      await signIn({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.name,
          avatarUrl: data.user.avatarUrl,
          isNewUser: false,
          profileComplete: true,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Dev login failed';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setIsDevLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Ionicons name="briefcase" size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>LuggageShare</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>{t('auth.tagline')}</Text>
        </View>

        {/* Error message */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Auth Buttons */}
        <View style={styles.authButtons}>
          {/* Google Sign In */}
          <TouchableOpacity
            style={[styles.authButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={24} color="#4285F4" />
            <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
          </TouchableOpacity>

          {/* Apple Sign In */}
          <TouchableOpacity
            style={[styles.authButton, styles.appleButton]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
            <Text style={styles.appleButtonText}>{t('auth.continueWithApple')}</Text>
          </TouchableOpacity>
        </View>

        {/* Dev Login */}
        {__DEV__ && (
          <TouchableOpacity
            style={[styles.authButton, styles.devButton]}
            onPress={handleDevLogin}
            disabled={isLoading}
          >
            {isDevLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="code-slash" size={24} color="#FFF" />
                <Text style={styles.devButtonText}>Dev Login (Skip Auth)</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Terms */}
        <View style={styles.terms}>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            {t('auth.termsPrefix')}{' '}
            <Text style={[styles.termsLink, { color: colors.primary }]}>
              {t('auth.termsOfService')}
            </Text>{' '}
            {t('auth.and')}{' '}
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
  devButton: {
    backgroundColor: '#7C3AED',
    marginTop: 8,
  },
  devButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
  },
});
