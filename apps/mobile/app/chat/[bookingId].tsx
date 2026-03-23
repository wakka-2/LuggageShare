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
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { V2_COLORS, RADIUS, BUBBLE_SHADOWS, GRADIENTS } from '@/providers/ThemeProvider';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { Avatar } from '@/components/common';
import { SkeletonLoader } from '@/components/animations';

export default function ChatScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState('');
  const { data: messages, isLoading } = useMessages(bookingId ?? null);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const { isConnected, sendMessage: socketSend, sendTyping, isOtherTyping } = useSocket(bookingId);

  // Mark as read when there are unread messages from the other user
  const lastReadCount = useRef(0);
  useEffect(() => {
    if (!bookingId || !messages?.length) return;
    const unreadFromOther = messages.filter((m: any) => m.senderId !== user?.id && !m.isRead);
    if (unreadFromOther.length > 0 && unreadFromOther.length !== lastReadCount.current) {
      lastReadCount.current = unreadFromOther.length;
      markAsRead.mutate(bookingId);
    }
  }, [bookingId, messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !bookingId) return;

    const text = messageText.trim();
    setMessageText('');

    try {
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
        <Animated.View
          entering={FadeInUp.duration(250).springify()}
          style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}
        >
          {!isMe && <Avatar name={item.sender.name} avatarUrl={item.sender.avatarUrl} size={28} />}
          {isMe ? (
            <LinearGradient
              colors={[...GRADIENTS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.messageBubble, styles.bubbleMe]}
            >
              <Text style={[styles.messageText, { color: '#FFF' }]}>{item.content}</Text>
              <Text style={[styles.messageTime, { color: 'rgba(255,255,255,0.65)' }]}>{time}</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.messageBubble, styles.bubbleOther]}>
              <Text style={[styles.messageText, { color: V2_COLORS.text }]}>{item.content}</Text>
              <Text style={[styles.messageTime, { color: V2_COLORS.textMuted }]}>{time}</Text>
            </View>
          )}
        </Animated.View>
      );
    },
    [user?.id, isRTL]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={20}
            color={V2_COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('chat.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.skeletonChat}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Animated.View
                key={`skel-${i}`}
                entering={FadeIn.delay(i * 60).duration(200)}
                style={[
                  styles.skeletonRow,
                  i % 2 === 0 ? styles.skeletonRowRight : styles.skeletonRowLeft,
                ]}
              >
                {i % 2 !== 0 && <SkeletonLoader width={28} height={28} borderRadius={14} />}
                <SkeletonLoader width={i % 2 === 0 ? '55%' : '65%'} height={48} borderRadius={20} />
              </Animated.View>
            ))}
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
              <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={48} color={V2_COLORS.textMuted} />
                <Text style={styles.emptyChatText}>{t('chat.startConversation')}</Text>
              </Animated.View>
            }
          />
        )}

        <Animated.View entering={SlideInDown.duration(300).springify()} style={styles.inputBar}>
          {isOtherTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>{t('chat.typing')}</Text>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={messageText}
              onChangeText={(text) => {
                setMessageText(text);
                sendTyping();
              }}
              placeholder={t('messages.typeMessage')}
              placeholderTextColor={V2_COLORS.textMuted}
              multiline
              maxLength={1000}
              textAlign={isRTL ? 'right' : 'left'}
              {...(Platform.OS === 'web'
                ? {
                    onKeyPress: (e: any) => {
                      if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    },
                  }
                : {
                    returnKeyType: 'send',
                    onSubmitEditing: handleSend,
                    blurOnSubmit: false,
                  })}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!messageText.trim() || sendMessage.isPending}
              style={{ opacity: messageText.trim() ? 1 : 0.4 }}
            >
              <LinearGradient colors={[...GRADIENTS.primary]} style={styles.sendBtn}>
                <Ionicons name="send" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  skeletonChat: { flex: 1, padding: 16, gap: 12 } as ViewStyle,
  skeletonRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 } as ViewStyle,
  skeletonRowRight: { justifyContent: 'flex-end' } as ViewStyle,
  skeletonRowLeft: { justifyContent: 'flex-start' } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  } as ViewStyle,
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...BUBBLE_SHADOWS.xs,
  } as ViewStyle,
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: V2_COLORS.text,
  } as TextStyle,

  messagesList: { padding: 16, paddingBottom: 8 } as ViewStyle,
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
    alignItems: 'flex-end',
  } as ViewStyle,
  messageRowMe: { justifyContent: 'flex-end' } as ViewStyle,
  messageRowOther: { justifyContent: 'flex-start' } as ViewStyle,
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 20 } as ViewStyle,
  bubbleMe: {
    borderBottomRightRadius: 6,
  } as ViewStyle,
  bubbleOther: {
    borderBottomLeftRadius: 6,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
  } as ViewStyle,
  messageText: { fontSize: 15, lineHeight: 21 } as TextStyle,
  messageTime: { fontSize: 11, marginTop: 4, textAlign: 'right' } as TextStyle,

  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
  } as ViewStyle,
  emptyChatText: { fontSize: 16, color: V2_COLORS.textMuted } as TextStyle,

  inputBar: {
    padding: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  } as ViewStyle,
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: V2_COLORS.bg,
    color: V2_COLORS.text,
  } as TextStyle,
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  typingIndicator: { paddingHorizontal: 16, paddingBottom: 4 } as ViewStyle,
  typingText: { fontSize: 12, fontStyle: 'italic', color: V2_COLORS.textMuted } as TextStyle,
});
