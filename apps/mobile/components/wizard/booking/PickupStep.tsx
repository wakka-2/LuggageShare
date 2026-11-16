import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, themed } from '@/providers/ThemeProvider';
import { QuestionTitle } from '../QuestionTitle';
import { AnimatedButton } from '@/components/animations/AnimatedButton';
import { LeafletMap, type LeafletMapHandle, type LatLng } from '@/components/maps/LeafletMap';
import { cityCenter, reverseGeocode, DEFAULT_CENTER } from '@/lib/geocode';
import { showAlert } from '@/lib/alert';
import type { StepProps } from '../WizardContainer';

export function PickupStep({ data, updateData, goNext }: StepProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const mapRef = useRef<LeafletMapHandle>(null);

  const initialPin: LatLng | null =
    typeof data.pickupLat === 'number' && typeof data.pickupLng === 'number'
      ? { lat: data.pickupLat, lng: data.pickupLng }
      : null;
  const [center, setCenter] = useState<LatLng | null>(initialPin);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  // Once the user types their own description we stop overwriting it.
  const addressEdited = useRef(!!data.pickupLocation && !initialPin);

  // Open the map on the departure city of the trip being booked.
  useEffect(() => {
    if (center) return;
    let alive = true;
    cityCenter(data.departureCity).then((c) => alive && setCenter(c ?? DEFAULT_CENTER));
    return () => {
      alive = false;
    };
  }, [center, data.departureCity]);

  const choosePoint = useCallback(
    async (point: LatLng) => {
      updateData({ pickupLat: point.lat, pickupLng: point.lng });
      if (addressEdited.current) return;
      setResolving(true);
      const address = await reverseGeocode(point, i18n.language);
      setResolving(false);
      updateData({
        pickupLocation: address ?? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`,
      });
    },
    [updateData, i18n.language]
  );

  const locateMe = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert(t('common.errorTitle'), t('booking.wizard.pickup.locationDenied'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      mapRef.current?.setMarker(point, true);
      await choosePoint(point);
    } catch {
      showAlert(t('common.errorTitle'), t('booking.wizard.pickup.locationFailed'));
    } finally {
      setLocating(false);
    }
  };

  const hasPin = typeof data.pickupLat === 'number';
  const canAdvance = !!data.pickupLocation?.trim() || hasPin;

  return (
    <View>
      <QuestionTitle emoji="📍" title={t('booking.wizard.pickup.title')} />

      <Animated.View entering={FadeInUp.delay(150).springify()} style={styles.mapCard}>
        {center ? (
          <LeafletMap
            ref={mapRef}
            center={center}
            zoom={initialPin ? 15 : 12}
            marker={initialPin}
            onPick={choosePoint}
            style={styles.map}
          />
        ) : (
          <View style={[styles.map, styles.mapLoading]}>
            <ActivityIndicator color={V2_COLORS.primary} />
          </View>
        )}
        <TouchableOpacity
          style={[styles.locateBtn, isRTL ? { left: 12 } : { right: 12 }]}
          onPress={locateMe}
          disabled={locating}
          accessibilityRole="button"
          accessibilityLabel={t('booking.wizard.pickup.useMyLocation')}
        >
          {locating ? (
            <ActivityIndicator size="small" color={V2_COLORS.primary} />
          ) : (
            <Ionicons name="locate" size={20} color={V2_COLORS.primary} />
          )}
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.hint}>
        {hasPin ? t('booking.wizard.pickup.pinSet') : t('booking.wizard.pickup.tapMap')}
      </Text>

      <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{t('booking.wizard.pickup.describe')}</Text>
          {resolving && <ActivityIndicator size="small" color={V2_COLORS.textMuted} />}
        </View>
        <TextInput
          style={styles.textArea}
          value={data.pickupLocation || ''}
          onChangeText={(v) => {
            addressEdited.current = v.trim().length > 0;
            updateData({ pickupLocation: v });
          }}
          placeholder={t('booking.wizard.pickup.placeholder')}
          placeholderTextColor={V2_COLORS.textMuted}
          multiline
          numberOfLines={3}
          maxLength={300}
          textAlignVertical="top"
          textAlign={isRTL ? 'right' : 'left'}
        />
      </Animated.View>

      {canAdvance && (
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <AnimatedButton title={t('wizard.next')} onPress={goNext} size="lg" fullWidth />
        </Animated.View>
      )}
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    mapCard: {
      borderRadius: RADIUS.card,
      overflow: 'hidden',
      marginBottom: 8,
      ...BUBBLE_SHADOWS.sm,
    },
    map: {
      height: 240,
    },
    mapLoading: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: V2_COLORS.surface,
    },
    locateBtn: {
      position: 'absolute',
      bottom: 28,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: V2_COLORS.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...BUBBLE_SHADOWS.sm,
    },
    hint: {
      fontSize: 12,
      color: V2_COLORS.textMuted,
      marginBottom: 20,
    },
    section: {
      marginBottom: 24,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: V2_COLORS.textSoft,
    },
    textArea: {
      height: 80,
      borderRadius: RADIUS.card,
      paddingHorizontal: 20,
      paddingVertical: 12,
      fontSize: 15,
      backgroundColor: V2_COLORS.surface,
      color: V2_COLORS.text,
      ...BUBBLE_SHADOWS.xs,
    },
  })
);
