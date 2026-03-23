import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import {
  V2_COLORS,
  RADIUS,
  BUBBLE_SHADOWS,
  GRADIENTS,
  TYPOGRAPHY,
} from '@/providers/ThemeProvider';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Avatar, BackgroundBlobs } from '@/components/common';
import { SkeletonLoader } from '@/components/animations';
import { showAlert } from '@/lib/alert';

export default function EditProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const { updateUser } = useAuth();

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { pickAndUpload, isUploading } = useImageUpload();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [iban, setIban] = useState('');
  const [bankName, setBankName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setCity(profile.city || '');
      setIban((profile as any).iban || '');
      setBankName((profile as any).bankName || '');
      setAvatarUrl(profile.avatarUrl);
    }
  }, [profile]);

  const handleChangePhoto = async () => {
    const url = await pickAndUpload({ folder: 'avatars', source: 'library' });
    if (url) {
      setAvatarUrl(url);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert(t('common.errorTitle'), t('profile.nameRequired'));
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        iban: iban.trim() || undefined,
        bankName: bankName.trim() || undefined,
        ...(avatarUrl !== profile?.avatarUrl ? { avatarUrl: avatarUrl || undefined } : {}),
      });

      updateUser({ displayName: name.trim() });

      showAlert(t('profile.profileUpdated'), t('profile.profileUpdatedMessage'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } catch {
      showAlert(t('common.errorTitle'), t('profile.failedUpdate'));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.backBtn} />
          <SkeletonLoader width={120} height={20} borderRadius={8} />
          <View style={styles.backBtn} />
        </View>
        <View style={styles.scrollContent}>
          <View style={{ alignItems: 'center', marginBottom: 32, gap: 12 }}>
            <SkeletonLoader width={96} height={96} borderRadius={48} />
            <SkeletonLoader width={120} height={32} borderRadius={16} />
          </View>
          {[0, 1, 2, 3].map((i) => (
            <Animated.View
              key={`skel-${i}`}
              entering={FadeIn.delay(i * 60).duration(200)}
              style={{ marginBottom: 20 }}
            >
              <SkeletonLoader width={80} height={14} borderRadius={6} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="100%" height={52} borderRadius={RADIUS.pill} />
            </Animated.View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundBlobs />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={20}
            color={V2_COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section with gradient ring */}
        <Animated.View
          entering={ZoomIn.delay(100).duration(400).springify()}
          style={styles.avatarSection}
        >
          <View style={styles.avatarRing}>
            <LinearGradient
              colors={[...GRADIENTS.primary]}
              style={styles.avatarGradientBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.avatarInner}>
                <Avatar name={name || '?'} avatarUrl={avatarUrl} size={88} />
              </View>
            </LinearGradient>
            <TouchableOpacity
              onPress={handleChangePhoto}
              disabled={isUploading}
              style={styles.cameraOverlay}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleChangePhoto}
            disabled={isUploading}
            style={styles.changePhotoBtn}
          >
            <Text style={styles.changePhotoText}>{t('profile.changePhoto')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.fieldGroup}>
            <Text style={styles.label}>
              {t('profile.name')} <Text style={{ color: V2_COLORS.secondary }}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('profile.enterName')}
              placeholderTextColor={V2_COLORS.textMuted}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(260).duration(300)} style={styles.fieldGroup}>
            <Text style={styles.label}>{t('profile.email')}</Text>
            <View style={styles.disabledField}>
              <Text style={styles.disabledText}>{profile?.email}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(320).duration(300)} style={styles.fieldGroup}>
            <Text style={styles.label}>{t('profile.city')}</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder={t('profile.placeholderCity')}
              placeholderTextColor={V2_COLORS.textMuted}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(380).duration(300)} style={styles.fieldGroup}>
            <Text style={styles.label}>{t('profile.bio')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder={t('profile.placeholderBio')}
              placeholderTextColor={V2_COLORS.textMuted}
              multiline
              numberOfLines={4}
              maxLength={300}
              textAlign={isRTL ? 'right' : 'left'}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/300</Text>
          </Animated.View>

          {/* Bank Details Section */}
          <Animated.Text entering={FadeInUp.delay(440).duration(300)} style={styles.sectionTitle}>
            {t('profile.bankDetails')}
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(500).duration(300)} style={styles.fieldGroup}>
            <Text style={styles.label}>{t('profile.bankNameField')}</Text>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder={t('profile.placeholderBankName')}
              placeholderTextColor={V2_COLORS.textMuted}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(560).duration(300)} style={styles.fieldGroup}>
            <Text style={styles.label}>{t('profile.ibanField')}</Text>
            <TextInput
              style={styles.input}
              value={iban}
              onChangeText={setIban}
              placeholder={t('profile.placeholderIban')}
              placeholderTextColor={V2_COLORS.textMuted}
              textAlign={isRTL ? 'right' : 'left'}
              autoCapitalize="characters"
            />
          </Animated.View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={updateProfile.isPending}
          style={{ opacity: updateProfile.isPending ? 0.7 : 1 }}
        >
          <LinearGradient
            colors={[...GRADIENTS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtn}
          >
            {updateProfile.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>{t('profile.saveChanges')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  } as ViewStyle,
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: V2_COLORS.text,
  } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,

  avatarSection: { alignItems: 'center', marginBottom: 32, gap: 12 } as ViewStyle,
  avatarRing: { position: 'relative' } as ViewStyle,
  avatarGradientBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  avatarInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: V2_COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as ViewStyle,
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: V2_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: V2_COLORS.bg,
  } as ViewStyle,
  changePhotoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.primary + '12',
  } as ViewStyle,
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: V2_COLORS.primary,
  } as TextStyle,

  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: V2_COLORS.text,
    marginTop: 12,
  } as TextStyle,
  form: { gap: 20 } as ViewStyle,
  fieldGroup: { gap: 8 } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: V2_COLORS.text,
  } as TextStyle,
  input: {
    height: 52,
    borderRadius: RADIUS.input,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: V2_COLORS.text,
    ...BUBBLE_SHADOWS.xs,
  } as TextStyle,
  textArea: {
    height: 120,
    paddingTop: 14,
    borderRadius: RADIUS.card,
  } as TextStyle,
  disabledField: {
    height: 52,
    borderRadius: RADIUS.input,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    opacity: 0.6,
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  disabledText: { fontSize: 16, color: V2_COLORS.textMuted } as TextStyle,
  charCount: { fontSize: 12, textAlign: 'right', color: V2_COLORS.textMuted } as TextStyle,

  bottomBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  saveBtn: {
    height: 52,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
