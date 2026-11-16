import { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { V2_COLORS, RADIUS, themed } from '@/providers/ThemeProvider';
import { dirIcon } from '@/lib/rtl';

interface CalendarModalProps {
  visible: boolean;
  value: Date | null;
  minimumDate?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
  /**
   * Render as an absolute overlay inside the current screen instead of a native
   * Modal window. Use where a Modal mis-sizes (Home tab on Android).
   */
  overlay?: boolean;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function locale(language: string) {
  // Gregorian calendar + Western digits in Arabic (ar-SA defaults to Hijri).
  return language === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB';
}

/**
 * In-app month calendar. Replaces the native Android dialog, which ignores the
 * app theme/language (English, teal, and unreadable in dark mode).
 */
export function CalendarModal({
  visible,
  value,
  minimumDate,
  onSelect,
  onClose,
  overlay,
}: CalendarModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const loc = locale(i18n.language);
  const today = startOfDay(new Date());
  const min = minimumDate ? startOfDay(minimumDate) : null;

  const [month, setMonth] = useState(() => {
    const base = value ?? min ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // Week starts on Sunday (common in Saudi Arabia and the US).
  const weekdays = useMemo(() => {
    const sunday = new Date(2026, 10, 15); // a known Sunday
    return Array.from({ length: 7 }, (_, i) =>
      new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i).toLocaleDateString(
        loc,
        {
          weekday: 'narrow',
        }
      )
    );
  }, [loc]);

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out: (Date | null)[] = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++)
      out.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (out.length % 7) out.push(null);
    return out;
  }, [month]);

  const title = month.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
  const canGoBack = !min || new Date(month.getFullYear(), month.getMonth(), 0) >= min;
  const shift = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  const content = (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={[styles.sheet, { direction: isRTL ? 'rtl' : 'ltr' }]} onPress={() => {}}>
        <View style={styles.header}>
          <Pressable
            onPress={() => canGoBack && shift(-1)}
            disabled={!canGoBack}
            style={[styles.navBtn, !canGoBack && styles.navDisabled]}
            accessibilityRole="button"
            accessibilityLabel={t('calendar.previousMonth')}
            hitSlop={8}
          >
            <Ionicons name={dirIcon('chevron-back')} size={20} color={V2_COLORS.text} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            onPress={() => shift(1)}
            style={styles.navBtn}
            accessibilityRole="button"
            accessibilityLabel={t('calendar.nextMonth')}
            hitSlop={8}
          >
            <Ionicons name={dirIcon('chevron-forward')} size={20} color={V2_COLORS.text} />
          </Pressable>
        </View>

        <View style={styles.row}>
          {weekdays.map((w, i) => (
            <Text key={i} style={styles.weekday}>
              {w}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <View key={i} style={styles.cell} />;
            const disabled = !!min && day < min;
            const selected = !!value && sameDay(day, value);
            const isToday = sameDay(day, today);
            return (
              <Pressable
                key={i}
                style={styles.cell}
                disabled={disabled}
                onPress={() => {
                  onSelect(day);
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityState={{ disabled, selected }}
                accessibilityLabel={day.toLocaleDateString(loc, { dateStyle: 'full' } as any)}
              >
                <View
                  style={[
                    styles.dayCircle,
                    isToday && !selected && styles.todayCircle,
                    selected && styles.selectedCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      disabled && styles.disabledText,
                      selected && styles.selectedText,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => {
              if (!min || today >= min) {
                onSelect(today);
                onClose();
              }
            }}
            style={styles.footerBtn}
          >
            <Text style={styles.footerText}>{t('calendar.today')}</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.footerBtn}>
            <Text style={styles.footerText}>{t('common.cancel')}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  );

  if (overlay) {
    if (!visible) return null;
    return (
      <View style={[StyleSheet.absoluteFill, styles.overlayRoot]}>
        <BackHandlerClose onClose={onClose} />
        {content}
      </View>
    );
  }
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {content}
    </Modal>
  );
}

/** Android back button closes the overlay calendar. */
function BackHandlerClose({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);
  return null;
}

const styles = themed(() =>
  StyleSheet.create({
    overlayRoot: { zIndex: 1000, elevation: 1000 },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    sheet: {
      width: '100%',
      maxWidth: 380,
      borderRadius: RADIUS.card,
      backgroundColor: V2_COLORS.surface,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    navBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: V2_COLORS.surfaceAlt,
    },
    navDisabled: { opacity: 0.35 },
    title: { fontSize: 17, fontWeight: '700', color: V2_COLORS.text },
    row: { flexDirection: 'row', marginBottom: 4 },
    weekday: {
      width: '14.28%',
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '600',
      color: V2_COLORS.textMuted,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
    dayCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayCircle: { borderWidth: 1.5, borderColor: V2_COLORS.primary },
    selectedCircle: { backgroundColor: V2_COLORS.primary },
    dayText: { fontSize: 15, fontWeight: '600', color: V2_COLORS.text },
    disabledText: { color: V2_COLORS.textMuted, opacity: 0.4 },
    selectedText: { color: '#FFFFFF' },
    footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
    footerBtn: { paddingHorizontal: 14, paddingVertical: 10 },
    footerText: { fontSize: 15, fontWeight: '700', color: V2_COLORS.primary },
  })
);
