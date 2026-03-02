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

import { useTheme } from '@/hooks/useTheme';
import { ThemeColors } from '@/providers/ThemeProvider';
import { useConversations, ApiConversation } from '@/hooks/useMessages';
import { EmptyState, Avatar } from '@/components/common';

function ConversationItem({
  conversation,
  isRTL,
  colors,
  onPress,
}: {
  conversation: ApiConversation;
  isRTL: boolean;
  colors: ThemeColors;
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.conversationItem, { backgroundColor: colors.card }]}>
        <Avatar
          name={conversation.otherUser.name}
          avatarUrl={conversation.otherUser.avatarUrl}
          size={48}
        />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, { color: colors.text }]} numberOfLines={1}>
              {conversation.otherUser.name}
            </Text>
            {timeString ? (
              <Text style={[styles.conversationTime, { color: colors.textSecondary }]}>
                {timeString}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.conversationRoute, { color: colors.primary }]} numberOfLines={1}>
            {conversation.route}
          </Text>
          <Text
            style={[styles.conversationMessage, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {conversation.lastMessage?.content || ''}
          </Text>
        </View>
        {conversation.unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data: conversations, isLoading, refetch } = useConversations();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('messages.title')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
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
                colors={colors}
                onPress={() => router.push(`/chat/${conversation.bookingId}`)}
              />
            </Animated.View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  header: { padding: 16, borderBottomWidth: 1 } as ViewStyle,
  title: { fontSize: 24, fontWeight: 'bold' } as TextStyle,
  scrollContent: { padding: 16, paddingBottom: 32 } as ViewStyle,
  loading: { paddingVertical: 60, alignItems: 'center' } as ViewStyle,
  emptyState: { marginTop: 40 } as ViewStyle,

  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    gap: 12,
  } as ViewStyle,
  conversationContent: { flex: 1 } as ViewStyle,
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  } as ViewStyle,
  conversationName: { fontSize: 16, fontWeight: '600', flex: 1 } as TextStyle,
  conversationTime: { fontSize: 12, marginStart: 8 } as TextStyle,
  conversationRoute: { fontSize: 12, fontWeight: '500', marginBottom: 2 } as TextStyle,
  conversationMessage: { fontSize: 14 } as TextStyle,
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: '700' } as TextStyle,
});
