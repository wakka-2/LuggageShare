import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  V2_COLORS,
  RADIUS,
  BUBBLE_SHADOWS,
  TYPOGRAPHY,
  GRADIENTS,
} from '@/providers/ThemeProvider';
import { useConversations, ApiConversation } from '@/hooks/useMessages';
import { EmptyState, Avatar, BackgroundBlobs } from '@/components/common';
import { SkeletonLoader } from '@/components/animations';
import { FloatingIcons, GradientAccentStrip, SparkleGroup } from '@/components/decorations';
import { LinearGradient } from 'expo-linear-gradient';

const ConversationItem = React.memo(function ConversationItem({
  conversation,
  isRTL,
  onPress,
}: {
  conversation: ApiConversation;
  isRTL: boolean;
  onPress: () => void;
}) {
  const lastMessageDate = conversation.lastMessage?.createdAt
    ? new Date(conversation.lastMessage.createdAt)
    : null;
  const timeString = lastMessageDate
    ? lastMessageDate.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const unreadLabel = conversation.unreadCount > 0 ? `, ${conversation.unreadCount} unread` : '';
  const lastMsg = conversation.lastMessage?.content ? `, ${conversation.lastMessage.content}` : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${conversation.otherUser.name}${lastMsg}${unreadLabel}`}
    >
      <View style={styles.conversationItem}>
        <GradientAccentStrip
          gradient={conversation.unreadCount > 0 ? 'warm' : 'cool'}
          position="left"
        />
        <Avatar
          name={conversation.otherUser.name}
          avatarUrl={conversation.otherUser.avatarUrl}
          size={48}
        />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {conversation.otherUser.name}
            </Text>
            {timeString ? <Text style={styles.conversationTime}>{timeString}</Text> : null}
          </View>
          <View style={styles.routePill}>
            <Text style={styles.conversationRoute} numberOfLines={1}>
              {conversation.route}
            </Text>
          </View>
          <Text style={styles.conversationMessage} numberOfLines={1}>
            {conversation.lastMessage?.content || ''}
          </Text>
        </View>
        {conversation.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function MessagesScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: conversations, isLoading, refetch } = useConversations();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackgroundBlobs variant="subtle" />
      <FloatingIcons variant="sparse" />

      {/* Decorated Header with gradient accent */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('messages.title')}</Text>
          <SparkleGroup variant="accent" style={{ marginStart: 8, marginTop: -4 }} />
        </View>
        <View style={styles.headerAccent}>
          <LinearGradient
            colors={[...GRADIENTS.cool]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerAccentGradient}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor={V2_COLORS.primary}
          />
        }
      >
        {isLoading && (
          <View style={styles.loading}>
            {[0, 1, 2, 3].map((i) => (
              <Animated.View
                key={`skel-${i}`}
                entering={FadeInDown.delay(i * 60).duration(300)}
                style={styles.skeletonConv}
              >
                <SkeletonLoader width={48} height={48} borderRadius={24} />
                <View style={{ flex: 1, gap: 6 }}>
                  <SkeletonLoader width="60%" height={16} borderRadius={RADIUS.pill} />
                  <SkeletonLoader width="40%" height={12} borderRadius={RADIUS.pill} />
                  <SkeletonLoader width="80%" height={14} borderRadius={RADIUS.pill} />
                </View>
              </Animated.View>
            ))}
          </View>
        )}

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

        {!isLoading &&
          conversations?.map((conversation, index) => (
            <Animated.View
              key={conversation.bookingId}
              entering={FadeInDown.delay(index * 50).duration(300)}
            >
              <ConversationItem
                conversation={conversation}
                isRTL={isRTL}
                onPress={() => router.push(`/chat/${conversation.bookingId}`)}
              />
            </Animated.View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  header: { padding: 16, paddingBottom: 12 } as ViewStyle,
  headerRow: { flexDirection: 'row', alignItems: 'center' } as ViewStyle,
  title: { ...TYPOGRAPHY.h1, color: V2_COLORS.text } as TextStyle,
  headerAccent: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
    width: 60,
  } as ViewStyle,
  headerAccentGradient: { flex: 1 } as ViewStyle,
  scrollContent: { padding: 16, paddingBottom: 32 } as ViewStyle,
  loading: { paddingVertical: 8 } as ViewStyle,
  skeletonConv: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: RADIUS.card,
    marginBottom: 10,
    gap: 12,
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  emptyState: { marginTop: 40 } as ViewStyle,

  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: RADIUS.card,
    marginBottom: 10,
    gap: 12,
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  conversationContent: { flex: 1 } as ViewStyle,
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  } as ViewStyle,
  conversationName: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: V2_COLORS.text,
    flex: 1,
  } as TextStyle,
  conversationTime: { fontSize: 11, color: V2_COLORS.textMuted, marginStart: 8 } as TextStyle,
  routePill: {
    backgroundColor: V2_COLORS.accent3 + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
    alignSelf: 'flex-start',
    marginBottom: 4,
  } as ViewStyle,
  conversationRoute: { fontSize: 11, fontWeight: '600', color: V2_COLORS.accent3 } as TextStyle,
  conversationMessage: { fontSize: 13, color: V2_COLORS.textSoft } as TextStyle,
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 6,
    backgroundColor: V2_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: '700' } as TextStyle,
});
