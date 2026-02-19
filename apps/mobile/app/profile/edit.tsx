import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common';

export default function EditProfileScreen() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const { updateUser } = useAuth();

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setCity(profile.city || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(isRTL ? 'خطأ' : 'Error', isRTL ? 'الاسم مطلوب' : 'Name is required');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
      });

      // Update local auth state
      updateUser({ displayName: name.trim() });

      Alert.alert(
        isRTL ? 'تم التحديث' : 'Profile Updated',
        isRTL ? 'تم تحديث ملفك الشخصي بنجاح' : 'Your profile has been updated successfully',
        [{ text: isRTL ? 'حسناً' : 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل تحديث الملف الشخصي' : 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile'}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Avatar name={name || '?'} avatarUrl={profile?.avatarUrl} size={96} />
          <TouchableOpacity style={[styles.changePhotoBtn, { borderColor: colors.primary }]}>
            <Ionicons name="camera-outline" size={16} color={colors.primary} />
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>
              {isRTL ? 'تغيير الصورة' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {isRTL ? 'الاسم' : 'Name'} <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
              placeholderTextColor={colors.textSecondary}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {isRTL ? 'البريد الإلكتروني' : 'Email'}
            </Text>
            <View style={[styles.input, styles.disabledInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.disabledText, { color: colors.textSecondary }]}>{profile?.email}</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {isRTL ? 'المدينة' : 'City'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={city}
              onChangeText={setCity}
              placeholder={isRTL ? 'مثال: الرياض' : 'e.g. Riyadh'}
              placeholderTextColor={colors.textSecondary}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              {isRTL ? 'نبذة عنك' : 'Bio'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={bio}
              onChangeText={setBio}
              placeholder={isRTL ? 'أخبرنا قليلاً عن نفسك...' : 'Tell us a little about yourself...'}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={300}
              textAlign={isRTL ? 'right' : 'left'}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>{bio.length}/300</Text>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={updateProfile.isPending}
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: updateProfile.isPending ? 0.7 : 1 }]}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>{isRTL ? 'حفظ التغييرات' : 'Save Changes'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  } as ViewStyle,
  headerBtn: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 100 } as ViewStyle,

  avatarSection: { alignItems: 'center', marginBottom: 32, gap: 12 } as ViewStyle,
  changePhotoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
  } as ViewStyle,
  changePhotoText: { fontSize: 14, fontWeight: '600' } as TextStyle,

  form: { gap: 20 } as ViewStyle,
  fieldGroup: { gap: 8 } as ViewStyle,
  label: { fontSize: 14, fontWeight: '600' } as TextStyle,
  input: {
    height: 52, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, borderWidth: 1,
  } as ViewStyle,
  textArea: { height: 120, paddingTop: 14 } as ViewStyle,
  disabledInput: { justifyContent: 'center', opacity: 0.7 } as ViewStyle,
  disabledText: { fontSize: 16 } as TextStyle,
  charCount: { fontSize: 12, textAlign: 'right' } as TextStyle,

  bottomBar: { padding: 16, borderTopWidth: 1 } as ViewStyle,
  saveBtn: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' } as TextStyle,
});
