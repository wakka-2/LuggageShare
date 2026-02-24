import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { Avatar } from '@/components/common';

export default function ChatScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState('');
  const { data: messages, isLoading } = useMessages(bookingId ?? null);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const { isConnected, sendMessage: socketSend, sendTyping, isOtherTyping } = useSocket(bookingId);

  // Mark as read only once on mount, and when new unread messages from others arrive
  const hasMarkedRead = useRef(false);
  useEffect(() => {
    if (!bookingId || !messages?.length) return;
    const hasUnread = messages.some((m: any) => m.senderId !== user?.id && !m.isRead);
    if (hasUnread || !hasMarkedRead.current) {
      hasMarkedRead.current = true;
      markAsRead.mutate(bookingId);
    }
  }, [bookingId, messages?.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !bookingId) return;

    const text = messageText.trim();
    setMessageText('');

    try {
      // Send via REST API (source of truth) + socket (real-time delivery)
      if (isConnected) socketSend(text);
      await sendMessage.mutateAsync({ bookingId, content: text });
    } catch {
      setMessageText(text);
    }
  };

  const renderMessage = useCallback(
    ({ item }: { item: typeof messages extends (infer T)[] | undefined ? T : never }) => {
      if (!item) return null;
      const isMe = item.senderId === user?.id;
      const time = new Date(item.createdAt).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return (
        <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
          {!isMe && <Avatar name={item.sender.name} avatarUrl={item.sender.avatarUrl} size={28} />}
          <View
            style={[
              styles.messageBubble,
              isMe
                ? [styles.bubbleMe, { backgroundColor: colors.primary }]
                : [styles.bubbleOther, { backgroundColor: colors.card }],
            ]}
          >
            <Text style={[styles.messageText, { color: isMe ? '#FFF' : colors.text }]}>
              {item.content}
            </Text>
            <Text
              style={[
                styles.messageTime,
                { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
              ]}
            >
              {time}
            </Text>
          </View>
        </View>
      );
    },
    [user?.id, isRTL, colors]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('chat.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages || []}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            maxToRenderPerBatch={15}
            windowSize={10}
            removeClippedSubviews
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>
                  {t('chat.startConversation')}
                </Text>
              </View>
            }
          />
        )}

        <View
          style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}
        >
          {isOtherTyping && (
            <View style={styles.typingIndicator}>
              <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                {t('chat.typing')}
              </Text>
            </View>
          )}
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
            value={messageText}
            onChangeText={(text) => {
              setMessageText(text);
              sendTyping();
            }}
            placeholder={t('messages.typeMessage')}
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={1000}
            textAlign={isRTL ? 'right' : 'left'}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!messageText.trim() || sendMessage.isPending}
            style={[
              styles.sendBtn,
              { backgroundColor: colors.primary, opacity: messageText.trim() ? 1 : 0.5 },
            ]}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  } as ViewStyle,
  headerBtn: { width: 40, alignItems: 'center' } as ViewStyle,
  headerTitle: { fontSize: 18, fontWeight: '600' } as TextStyle,

  messagesList: { padding: 16, paddingBottom: 8 } as ViewStyle,
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
    alignItems: 'flex-end',
  } as ViewStyle,
  messageRowMe: { justifyContent: 'flex-end' } as ViewStyle,
  messageRowOther: { justifyContent: 'flex-start' } as ViewStyle,
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 } as ViewStyle,
  bubbleMe: { borderBottomRightRadius: 4 } as ViewStyle,
  bubbleOther: { borderBottomLeftRadius: 4 } as ViewStyle,
  messageText: { fontSize: 15, lineHeight: 21 } as TextStyle,
  messageTime: { fontSize: 11, marginTop: 4, textAlign: 'right' } as TextStyle,

  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
  } as ViewStyle,
  emptyChatText: { fontSize: 16 } as TextStyle,

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
  } as ViewStyle,
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  } as TextStyle,
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  typingIndicator: { paddingHorizontal: 16, paddingBottom: 4 } as ViewStyle,
  typingText: { fontSize: 12, fontStyle: 'italic' } as TextStyle,
});
