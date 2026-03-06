import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { ThemeColors, SPACING, TYPOGRAPHY, RADIUS, SECTION_TINTS } from '@/providers/ThemeProvider';
import { useConversations, ApiConversation } from '@/hooks/useMessages';
import { SolidCard, EmptyState, Avatar } from '@/components/common';
import { SkeletonLoader } from '@/components/animations';

// ─── Animated Touchable ──────────────────────────────────
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ─── Conversation Item (V2 — solid card with accent) ─────
interface ConversationItemProps {
  conversation: ApiConversation;
  isRTL: boolean;
  colors: ThemeColors;
  onPress: () => void;
}

const ConversationItem = React.memo(function ConversationItem({
  conversation,
  isRTL,
  colors,
  onPress,
}: ConversationItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const lastMessageDate = conversation.lastMessage?.createdAt
    ? new Date(conversation.lastMessage.createdAt)
    : null;

  const timeString = lastMessageDate
    ? lastMessageDate.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const hasUnread = conversation.unreadCount > 0;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={animatedStyle}
      accessibilityRole="button"
      accessibilityLabel={`${conversation.otherUser.name}, ${conversation.route}${
        hasUnread ? `, ${conversation.unreadCount} unread` : ''
      }`}
    >
      <SolidCard
        accentColor={hasUnread ? colors.primary : undefined}
        tint={hasUnread ? SECTION_TINTS.purple : '#FFFFFF'}
        noPadding
      >
        <View style={styles.itemInner}>
          {/* Avatar with colored ring for unread */}
          <View
            style={hasUnread ? [styles.avatarRing, { borderColor: colors.primary }] : undefined}
          >
            <Avatar
              name={conversation.otherUser.name}
              avatarUrl={conversation.otherUser.avatarUrl}
              size={48}
            />
          </View>

          {/* Content */}
          <View style={styles.itemContent}>
            {/* Top row: Name + Time */}
            <View style={styles.itemTopRow}>
              <Text
                style={[
                  styles.itemName,
                  { color: colors.text, fontWeight: hasUnread ? '700' : '500' },
                ]}
                numberOfLines={1}
              >
                {conversation.otherUser.name}
              </Text>
              {timeString ? (
                <Text style={[styles.itemTime, { color: colors.textMuted }]}>{timeString}</Text>
              ) : null}
            </View>

            {/* Route pill badge (V2 — colored tint) */}
            {conversation.route ? (
              <View style={[styles.routePill, { backgroundColor: SECTION_TINTS.blue }]}>
                <Ionicons name="airplane" size={10} color="#3B82F6" />
                <Text style={[styles.routePillText, { color: '#3B82F6' }]}>
                  {conversation.route}
                </Text>
              </View>
            ) : null}

            {/* Last message preview */}
            <Text
              style={[
                styles.itemMessage,
                {
                  color: hasUnread ? colors.text : colors.textMuted,
                  fontWeight: hasUnread ? '500' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {conversation.lastMessage?.content || ''}
            </Text>
          </View>

          {/* Unread badge (V2 — solid pill) */}
          {hasUnread && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </SolidCard>
    </AnimatedTouchable>
  );
});

// ─── Skeleton Item ───────────────────────────────────────
function ConversationSkeleton() {
  return (
    <SolidCard noPadding>
      <View style={styles.itemInner}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonTopRow}>
            <SkeletonLoader width="55%" height={16} borderRadius={RADIUS.button} />
            <SkeletonLoader width={36} height={12} borderRadius={RADIUS.button} />
          </View>
          <SkeletonLoader
            width={72}
            height={18}
            borderRadius={RADIUS.pill}
            style={{ marginTop: SPACING[1] }}
          />
          <SkeletonLoader
            width="80%"
            height={14}
            borderRadius={RADIUS.button}
            style={{ marginTop: SPACING[1] }}
          />
        </View>
      </View>
    </SolidCard>
  );
}

// ─── Messages Screen (V2) ───────────────────────────────
export default function MessagesScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: conversations, isLoading, refetch } = useConversations();

  const handleConversationPress = useCallback(
    (bookingId: string) => {
      router.push(`/chat/${bookingId}`);
    },
    [router]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]} edges={['top']}>
      {/* Header (V2 — with message icon) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: SECTION_TINTS.purple }]}>
            <Ionicons name="chatbubbles" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('messages.title')}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
          />
        }
      >
        {/* Loading skeletons */}
        {isLoading &&
          [0, 1, 2, 3].map((i) => (
            <Animated.View
              key={`skel-${i}`}
              entering={FadeInDown.delay(i * 60)
                .duration(300)
                .springify()}
              style={styles.cardSpacing}
            >
              <ConversationSkeleton />
            </Animated.View>
          ))}

        {/* Empty state */}
        {!isLoading && (!conversations || conversations.length === 0) && (
          <EmptyState
            lottieAnimation="search"
            title={t('messages.noConversations')}
            description={t('messages.startConversation')}
            actionLabel={t('messages.browseListings')}
            onAction={() => router.push('/(tabs)')}
            style={styles.emptyState}
          />
        )}

        {/* Conversation list */}
        {!isLoading &&
          conversations?.map((conversation, index) => (
            <Animated.View
              key={conversation.bookingId}
              entering={FadeInDown.delay(index * 60)
                .duration(350)
                .springify()}
              style={styles.cardSpacing}
            >
              <ConversationItem
                conversation={conversation}
                isRTL={isRTL}
                colors={colors}
                onPress={() => handleConversationPress(conversation.bookingId)}
              />
            </Animated.View>
          ))}

        {/* Bottom spacer for absolute tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles (V2 — solid, colorful) ──────────────────────
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[4],
    paddingBottom: SPACING[3],
  } as ViewStyle,

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  } as ViewStyle,

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  title: {
    ...TYPOGRAPHY.h1,
    letterSpacing: -0.5,
  } as TextStyle,

  scrollContent: {
    paddingHorizontal: SPACING[4],
  } as ViewStyle,

  cardSpacing: {
    marginBottom: SPACING[2],
  } as ViewStyle,

  bottomSpacer: {
    height: 80,
  } as ViewStyle,

  emptyState: {
    marginTop: SPACING[8],
  } as ViewStyle,

  // Conversation item inner layout
  itemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    gap: SPACING[3],
  } as ViewStyle,

  avatarRing: {
    borderWidth: 2,
    borderRadius: 28,
    padding: 2,
  } as ViewStyle,

  itemContent: {
    flex: 1,
    gap: SPACING[1],
  } as ViewStyle,

  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  itemName: {
    ...TYPOGRAPHY.body,
    flex: 1,
    marginEnd: SPACING[2],
  } as TextStyle,

  itemTime: {
    ...TYPOGRAPHY.micro,
  } as TextStyle,

  routePill: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING[2],
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  } as ViewStyle,

  routePillText: {
    ...TYPOGRAPHY.micro,
    fontWeight: '700',
    letterSpacing: 0.5,
  } as TextStyle,

  itemMessage: {
    ...TYPOGRAPHY.caption,
  } as TextStyle,

  // Unread badge
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginStart: SPACING[1],
  } as ViewStyle,

  unreadText: {
    color: '#FFFFFF',
    ...TYPOGRAPHY.micro,
    fontWeight: '700',
    lineHeight: 14,
  } as TextStyle,

  // Skeleton
  skeletonContent: {
    flex: 1,
    gap: SPACING[1],
  } as ViewStyle,

  skeletonTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
});
