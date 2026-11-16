import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, GRADIENTS } from '@/providers/ThemeProvider';
import { BackgroundBlobs } from '@/components/common';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAppleAuth } from '@/hooks/useAppleAuth';
import { useEmailAuth } from '@/hooks/useEmailAuth';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { showAlert } from '@/lib/alert';
import { getApiErrorMessage, mapAuthResponseToSession } from '@/lib/mappers';
import { openLegalPage } from '@/lib/links';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const {
    signInWithGoogle,
    isLoading: isGoogleLoading,
    isConfigured: isGoogleConfigured,
  } = useGoogleAuth();
  const {
    signInWithApple,
    isLoading: isAppleLoading,
    isAvailable: isAppleAvailable,
  } = useAppleAuth();
  const { signInWithEmail, registerWithEmail, isLoading: isEmailLoading } = useEmailAuth();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isDevLoading, setIsDevLoading] = useState(false);
  const [mode, setMode] = useState<'signIn' | 'register'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLoading = isGoogleLoading || isAppleLoading || isEmailLoading || isDevLoading;
  const showSocial = isGoogleConfigured || isAppleAvailable;
  const inputAlign = { textAlign: isRTL ? 'right' : 'left' } as const;

  const handleEmailSubmit = async () => {
    setError(null);
    if (mode === 'register' && name.trim().length < 2) {
      setError(t('auth.nameRequired'));
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(t('auth.invalidEmail'));
      return;
    }
    if (mode === 'register' && password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    try {
      if (mode === 'register') {
        await registerWithEmail(name, email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const message =
        status === 401
          ? t('auth.invalidCredentials')
          : status === 409
            ? t('auth.emailTaken')
            : getApiErrorMessage(err, t('common.error'));
      setError(message);
    }
  };

  const toggleMode = () => {
    setError(null);
    setMode((m) => (m === 'signIn' ? 'register' : 'signIn'));
  };

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
      await signIn(mapAuthResponseToSession(data));
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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

          {/* Email / password */}
          <Animated.View entering={FadeInUp.delay(450).duration(400)} style={styles.authButtons}>
            {mode === 'register' && (
              <TextInput
                style={[styles.input, inputAlign]}
                placeholder={t('auth.name')}
                placeholderTextColor={V2_COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoComplete="name"
                textContentType="name"
                editable={!isLoading}
              />
            )}
            <TextInput
              style={[styles.input, inputAlign]}
              placeholder={t('auth.email')}
              placeholderTextColor={V2_COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isLoading}
            />
            <TextInput
              style={[styles.input, inputAlign]}
              placeholder={t('auth.password')}
              placeholderTextColor={V2_COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              textContentType={mode === 'register' ? 'newPassword' : 'password'}
              onSubmitEditing={handleEmailSubmit}
              returnKeyType="go"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleEmailSubmit}
              disabled={isLoading}
              accessibilityRole="button"
            >
              {isEmailLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'register' ? t('auth.createAccount') : t('auth.signIn')}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleMode} disabled={isLoading} style={styles.modeToggle}>
              <Text style={styles.modeToggleText}>
                {mode === 'register' ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
                <Text style={styles.termsLink}>
                  {mode === 'register' ? t('auth.signIn') : t('auth.createAccount')}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Social sign-in — only providers that work on this platform/build */}
          {showSocial && (
            <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.authButtons}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              {isGoogleConfigured && (
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-google" size={24} color="#4285F4" />
                  <Text style={styles.googleButtonText}>{t('auth.continueWithGoogle')}</Text>
                </TouchableOpacity>
              )}

              {isAppleAvailable && (
                <TouchableOpacity
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                  <Text style={styles.appleButtonText}>{t('auth.continueWithApple')}</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

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
              {t('auth.termsPrefix')}{' '}
              <Text
                style={styles.termsLink}
                onPress={() => openLegalPage('terms')}
                accessibilityRole="link"
              >
                {t('auth.termsOfService')}
              </Text>{' '}
              {t('auth.and')}{' '}
              <Text
                style={styles.termsLink}
                onPress={() => openLegalPage('privacy')}
                accessibilityRole="link"
              >
                {t('auth.privacyPolicy')}
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: RADIUS.pill,
    fontSize: 16,
    backgroundColor: V2_COLORS.surface,
    color: V2_COLORS.text,
    ...BUBBLE_SHADOWS.sm,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: 54,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  modeToggle: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  modeToggleText: {
    fontSize: 14,
    color: V2_COLORS.textSoft,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: V2_COLORS.textMuted,
  },
  dividerText: {
    fontSize: 13,
    color: V2_COLORS.textMuted,
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
    backgroundColor: V2_COLORS.surface,
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
