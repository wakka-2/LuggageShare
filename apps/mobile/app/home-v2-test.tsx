/**
 * V2 Design Prototype — Standalone test page
 * Route: /home-v2-test
 *
 * Style: Irregular blob backgrounds + bubbly buttons + light colorful palette
 * Inspired by: design4users elegant e-commerce concepts
 *
 * This is ONLY a visual prototype — no real data or navigation logic.
 * Delete after design approval.
 */

import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Color Palette (light, bubbly, playful) ─────────────────────
const C = {
  bg: '#F8F5FF', // very light lavender
  white: '#FFFFFF',
  primary: '#7C6AFF', // soft purple
  primaryLight: '#B4ABFF',
  secondary: '#FF6B9D', // coral pink
  accent1: '#56D8B1', // mint green
  accent2: '#FFBE5C', // warm amber
  accent3: '#5CB8FF', // sky blue
  text: '#2D2B55', // dark indigo
  textSoft: '#6E6B8A', // muted purple-gray
  textMuted: '#A8A5C0',
  blob1: '#EDE7FF', // light purple blob
  blob2: '#FFE5ED', // light pink blob
  blob3: '#E0F7EE', // light mint blob
  blob4: '#FFF3D6', // light amber blob
  cardShadow: 'rgba(124, 106, 255, 0.12)',
};

// ─── Background Blobs (SVG) ─────────────────────────────────────
function BackgroundBlobs() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={SCREEN_W} height={900} style={StyleSheet.absoluteFill}>
        {/* Top-right large blob */}
        <Circle cx={SCREEN_W - 30} cy={80} r={140} fill={C.blob1} opacity={0.6} />
        {/* Top-left small blob */}
        <Ellipse cx={-20} cy={200} rx={100} ry={120} fill={C.blob2} opacity={0.5} />
        {/* Middle-right blob */}
        <Circle cx={SCREEN_W + 20} cy={420} r={100} fill={C.blob3} opacity={0.5} />
        {/* Bottom-left large blob */}
        <Ellipse cx={40} cy={650} rx={160} ry={130} fill={C.blob4} opacity={0.4} />
        {/* Bottom-right tiny blob */}
        <Circle cx={SCREEN_W - 80} cy={750} r={60} fill={C.blob1} opacity={0.3} />
      </Svg>
    </View>
  );
}

// ─── Bubbly Button ───────────────────────────────────────────────
function BubbleButton({
  label,
  icon,
  color = C.primary,
  textColor = '#FFF',
  outline = false,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  textColor?: string;
  outline?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.bubbleBtn,
        outline
          ? { backgroundColor: 'transparent', borderWidth: 2, borderColor: color }
          : { backgroundColor: color },
        pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={outline ? color : textColor}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[styles.bubbleBtnText, { color: outline ? color : textColor }]}>{label}</Text>
    </Pressable>
  );
}

// ─── Stat Bubble ─────────────────────────────────────────────────
function StatBubble({
  value,
  label,
  icon,
  color,
}: {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={[styles.statBubble, { shadowColor: color }]}>
      <View style={[styles.statIconBubble, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Listing Card (Bubbly style) ─────────────────────────────────
function MockListingCard({
  from,
  to,
  price,
  date,
  avatar,
  name,
  color,
}: {
  from: string;
  to: string;
  price: string;
  date: string;
  avatar: string;
  name: string;
  color: string;
}) {
  return (
    <View style={styles.listingCard}>
      {/* Route pill */}
      <View style={styles.routeRow}>
        <View style={[styles.routeDot, { backgroundColor: C.accent1 }]} />
        <Text style={styles.routeCity}>{from}</Text>
        <Ionicons
          name="arrow-forward"
          size={14}
          color={C.textMuted}
          style={{ marginHorizontal: 8 }}
        />
        <View style={[styles.routeDot, { backgroundColor: C.secondary }]} />
        <Text style={styles.routeCity}>{to}</Text>
      </View>

      {/* Info row */}
      <View style={styles.listingInfoRow}>
        <View style={styles.listingMeta}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={13} color={C.textSoft} />
            <Text style={styles.metaText}>{date}</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: color + '12' }]}>
            <Text style={[styles.metaText, { color, fontWeight: '700' }]}>{price}</Text>
          </View>
        </View>
      </View>

      {/* User row */}
      <View style={styles.userRow}>
        <View style={[styles.avatarCircle, { backgroundColor: color + '20' }]}>
          <Text style={[styles.avatarEmoji]}>{avatar}</Text>
        </View>
        <Text style={styles.userName}>{name}</Text>
        <View style={{ flex: 1 }} />
        <Pressable style={[styles.viewBtn, { backgroundColor: color }]}>
          <Text style={styles.viewBtnText}>View</Text>
          <Ionicons name="chevron-forward" size={14} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
export default function HomeV2Test() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackgroundBlobs />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ───────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.headerName}>Ahmad</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="search-outline" size={22} color={C.text} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={C.text} />
              <View style={styles.notifDot} />
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Hero Card (gradient + bubbly) ─────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <LinearGradient
            colors={['#7C6AFF', '#9D8FFF', '#B4ABFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Decorative circles inside hero */}
            <View style={styles.heroDecoCircle1} />
            <View style={styles.heroDecoCircle2} />

            <Text style={styles.heroTitle}>Send your luggage{'\n'}with travelers</Text>
            <Text style={styles.heroSub}>Connect with people heading your way</Text>
            <View style={styles.heroButtons}>
              <BubbleButton
                label="Send Package"
                icon="cube-outline"
                color="#FFF"
                textColor={C.primary}
              />
              <BubbleButton
                label="Carry & Earn"
                icon="airplane-outline"
                color="rgba(255,255,255,0.25)"
                textColor="#FFF"
              />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Quick Search (bubbly inputs) ───────────────────── */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Where are you sending?</Text>
          <View style={styles.searchRow}>
            <View style={[styles.searchInput, { flex: 1 }]}>
              <View style={[styles.searchDot, { backgroundColor: C.accent1 }]} />
              <Text style={styles.searchPlaceholder}>From city...</Text>
            </View>
            <Pressable style={styles.swapBtn}>
              <Ionicons name="swap-horizontal" size={18} color={C.primary} />
            </Pressable>
            <View style={[styles.searchInput, { flex: 1 }]}>
              <View style={[styles.searchDot, { backgroundColor: C.secondary }]} />
              <Text style={styles.searchPlaceholder}>To city...</Text>
            </View>
          </View>
          <Pressable style={styles.searchGoBtn}>
            <LinearGradient
              colors={[C.primary, '#9D8FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.searchGoBtnGrad}
            >
              <Ionicons name="search" size={18} color="#FFF" />
              <Text style={styles.searchGoText}>Search Routes</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ── Stats Row (bubbly cards) ───────────────────────── */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.statsRow}>
          <StatBubble value="2.5K" label="Travelers" icon="people" color={C.primary} />
          <StatBubble value="15K+" label="Deliveries" icon="cube" color={C.accent1} />
          <StatBubble value="4.8" label="Rating" icon="star" color={C.accent2} />
        </Animated.View>

        {/* ── Category Pills ──────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(350).duration(500)} style={styles.pillRow}>
          <View style={[styles.pill, styles.pillActive]}>
            <Text style={[styles.pillText, styles.pillTextActive]}>All</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons
              name="airplane-outline"
              size={14}
              color={C.textSoft}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.pillText}>Carriers</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="cube-outline" size={14} color={C.textSoft} style={{ marginRight: 4 }} />
            <Text style={styles.pillText}>Senders</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons
              name="flash-outline"
              size={14}
              color={C.textSoft}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.pillText}>Express</Text>
          </View>
        </Animated.View>

        {/* ── Section Header ──────────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Routes</Text>
          <Pressable>
            <Text style={[styles.seeAll, { color: C.primary }]}>See All</Text>
          </Pressable>
        </Animated.View>

        {/* ── Mock Listing Cards ──────────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(450).duration(500)}>
          <MockListingCard
            from="Dubai"
            to="Amman"
            price="$25/kg"
            date="Mar 15"
            avatar="👨‍✈️"
            name="Khalid M."
            color={C.primary}
          />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(520).duration(500)}>
          <MockListingCard
            from="Istanbul"
            to="Riyadh"
            price="$18/kg"
            date="Mar 20"
            avatar="👩"
            name="Sara A."
            color={C.secondary}
          />
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(590).duration(500)}>
          <MockListingCard
            from="Cairo"
            to="London"
            price="$30/kg"
            date="Mar 22"
            avatar="🧔"
            name="Omar H."
            color={C.accent3}
          />
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    paddingBottom: 32,
  },

  // ── Header ──────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: C.textSoft,
    fontWeight: '500',
  },
  headerName: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.secondary,
    borderWidth: 1.5,
    borderColor: C.white,
  },

  // ── Hero Card ───────────────────
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroDecoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroDecoCircle2: {
    position: 'absolute',
    bottom: -20,
    left: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
    fontWeight: '500',
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  // ── Bubble Button ────────────────
  bubbleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 50,
  },
  bubbleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Search Section ──────────────
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  searchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: C.textMuted,
    fontWeight: '500',
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.blob1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchGoBtn: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  searchGoBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    gap: 8,
  },
  searchGoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },

  // ── Stats ───────────────────────
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statBubble: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  statIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // ── Category Pills ──────────────
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: 'rgba(124,106,255,0.08)',
  },
  pillActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSoft,
  },
  pillTextActive: {
    color: '#FFF',
  },

  // ── Section Header ──────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },

  // ── Listing Card ────────────────
  listingCard: {
    marginHorizontal: 20,
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: C.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  routeCity: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  listingInfoRow: {
    marginBottom: 14,
  },
  listingMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSoft,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    gap: 4,
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
