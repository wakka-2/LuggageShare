import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, RADIUS } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { StepProps } from '../WizardContainer';

export function PhotosStep({ data, updateData, goNext }: StepProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const imageUpload = useImageUpload();

  const imageUrls: string[] = data.imageUrls || [];

  const handleAddImage = async () => {
    const url = await imageUpload.pickAndUpload({ folder: 'items' });
    if (url) {
      updateData({ imageUrls: [...imageUrls, url] });
    }
  };

  const handleRemoveImage = (index: number) => {
    updateData({ imageUrls: imageUrls.filter((_, i) => i !== index) });
  };

  return (
    <View>
      <QuestionTitle
        emoji="📸"
        title={t('booking.wizard.photos.title', { defaultValue: 'Add photos of your item' })}
      />

      {/* Photo Grid */}
      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.grid}>
        {imageUrls.map((url, index) => (
          <Animated.View key={url} entering={FadeIn.duration(300)} style={styles.photoWrapper}>
            <Image source={{ uri: url }} style={styles.photo} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveImage(index)}>
              <Ionicons name="close-circle" size={22} color="#EF4444" />
            </TouchableOpacity>
          </Animated.View>
        ))}

        {imageUrls.length < 3 && (
          <TouchableOpacity
            style={[
              styles.addBtn,
              { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
            ]}
            onPress={handleAddImage}
            disabled={imageUpload.isUploading}
          >
            {imageUpload.isUploading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={[styles.addText, { color: colors.primary }]}>
                  {t('booking.addPhoto', { defaultValue: 'Add' })}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Hint */}
      <Animated.View entering={FadeIn.delay(500)} style={styles.hint}>
        <Text style={[styles.hintText, { color: colors.textMuted }]}>
          💡{' '}
          {t('booking.wizard.photos.hint', {
            defaultValue: 'Clear photos help carriers feel confident',
          })}
        </Text>
      </Animated.View>

      {/* Actions */}
      <View style={styles.actions}>
        <AnimatedButton
          title={t('wizard.next', { defaultValue: 'Next' })}
          onPress={goNext}
          size="lg"
          fullWidth
        />
        {imageUrls.length === 0 && (
          <AnimatedButton
            title={t('wizard.skip', { defaultValue: 'Skip' })}
            onPress={goNext}
            variant="ghost"
            size="sm"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.button,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  addBtn: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.button,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hint: {
    marginBottom: 24,
  },
  hintText: {
    fontSize: 14,
  },
  actions: {
    alignItems: 'center',
    gap: 8,
  },
});
