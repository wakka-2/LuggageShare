import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, GRADIENTS } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAppleAuth } from '@/hooks/useAppleAuth';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { showAlert } from '@/lib/alert';

export default function LoginScreen() {
  const { t } = useTranslation();
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
      showAlert(t('common.error'), message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setError(null);
      await signInWithApple();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
      showAlert(t('common.error'), message);
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
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
      showAlert(t('common.errorTitle'), message);
    } finally {
      setIsDevLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Animated.View entering={ZoomIn.delay(100).duration(500).springify()}>
            <LinearGradient
              colors={[...GRADIENTS.primary]}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="briefcase" size={48} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(250).duration(400)} style={styles.appName}>
            LuggageShare
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(350).duration(400)} style={styles.tagline}>
            {t('auth.tagline')}
          </Animated.Text>
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={V2_COLORS.secondary} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Auth Buttons */}
        <Animated.View entering={FadeInUp.delay(450).duration(400)} style={styles.authButtons}>
          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={24} color="#4285F4" />
            <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
          </TouchableOpacity>

          {/* Apple Sign In */}
          <TouchableOpacity
            style={styles.appleButton}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
            <Text style={styles.appleButtonText}>{t('auth.continueWithApple')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Dev Login */}
        {__DEV__ && (
          <Animated.View entering={FadeInUp.delay(550).duration(300)}>
            <TouchableOpacity
              style={styles.devButton}
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
          </Animated.View>
        )}

        {/* Terms */}
        <Animated.View entering={FadeIn.delay(650).duration(500)} style={styles.terms}>
          <Text style={styles.termsText}>
            {t('auth.termsPrefix')} <Text style={styles.termsLink}>{t('auth.termsOfService')}</Text>{' '}
            {t('auth.and')} <Text style={styles.termsLink}>{t('auth.privacyPolicy')}</Text>
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_COLORS.bg,
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
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...BUBBLE_SHADOWS.lg,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    color: V2_COLORS.text,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    color: V2_COLORS.textSoft,
  },
  authButtons: {
    gap: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: RADIUS.pill,
    gap: 12,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: V2_COLORS.text,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: RADIUS.pill,
    gap: 12,
    backgroundColor: '#000000',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: RADIUS.pill,
    gap: 12,
    backgroundColor: V2_COLORS.primary,
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
    color: V2_COLORS.textMuted,
  },
  termsLink: {
    fontWeight: '600',
    color: V2_COLORS.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: RADIUS.card,
    marginBottom: 16,
    backgroundColor: V2_COLORS.secondary + '12',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: V2_COLORS.secondary,
  },
});
