import { useMemo, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';

import { V2_COLORS, BUBBLE_SHADOWS, themed } from '@/providers/ThemeProvider';

interface ValueSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  accessibilityLabel?: string;
}

/**
 * Draggable horizontal slider (tap or drag anywhere on the track). RTL aware:
 * in Arabic the minimum is on the right, matching the mirrored layout.
 */
export function ValueSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  accessibilityLabel,
}: ValueSliderProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [width, setWidth] = useState(0);
  const startX = useRef(0);

  // Keep latest props for the PanResponder (created once).
  const latest = useRef({ width, isRTL, min, max, step, onChange, value });
  latest.current = { width, isRTL, min, max, step, onChange, value };

  const valueAt = (x: number) => {
    const { width: w, isRTL: rtl, min: lo, max: hi, step: st } = latest.current;
    if (w <= 0) return latest.current.value;
    const ratio = Math.min(1, Math.max(0, x / w));
    const raw = lo + (rtl ? 1 - ratio : ratio) * (hi - lo);
    return Math.min(hi, Math.max(lo, Math.round(raw / st) * st));
  };

  const emit = (x: number) => {
    const next = valueAt(x);
    if (next !== latest.current.value) latest.current.onChange(next);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        // Don't let the wizard's vertical ScrollView steal the drag.
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt) => {
          startX.current = evt.nativeEvent.locationX;
          emit(startX.current);
        },
        onPanResponderMove: (_evt, g) => emit(startX.current + g.dx),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const ratio = (Math.min(max, Math.max(min, value)) - min) / (max - min || 1);

  return (
    <View
      style={styles.touchArea}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onChange(
          Math.min(
            max,
            Math.max(min, value + (e.nativeEvent.actionName === 'increment' ? step : -step))
          )
        )
      }
      {...responder.panHandlers}
    >
      {/* Children ignore touches so locationX is always relative to the track. */}
      <View style={styles.track} pointerEvents="none">
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          { start: Math.min(Math.max(0, width - THUMB), Math.max(0, ratio * width - THUMB / 2)) },
        ]}
      />
    </View>
  );
}

const THUMB = 24;

const styles = themed(() =>
  StyleSheet.create({
    touchArea: { flex: 1, height: 44, justifyContent: 'center' },
    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: V2_COLORS.surfaceAlt,
      overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: 4, backgroundColor: V2_COLORS.primary },
    thumb: {
      position: 'absolute',
      width: THUMB,
      height: THUMB,
      borderRadius: THUMB / 2,
      backgroundColor: '#FFFFFF',
      borderWidth: 3,
      borderColor: V2_COLORS.primary,
      ...BUBBLE_SHADOWS.sm,
    },
  })
);
