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
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, SlideInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useGoBack } from '@/hooks/useGoBack';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, ScreenHeader } from '@/components/common';
import { SkeletonLoader } from '@/components/animations';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export default function OfferChatScreen() {
  const { offerId } = useLocalSearchParams<{ offerId: string }>();
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const goBack = useGoBack();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState('');

  // Fetch offer messages
  const { data: messages, isLoading } = useQuery<any[]>({
    queryKey: ['offerMessages', offerId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/messages/offers/${offerId}`);
      const result = data.data ?? data;
      return result.messages ?? result;
    },
    enabled: !!offerId,
    refetchInterval: 5000,
  });

  // Send offer message
  const sendMessage = useMutation({
    mutationFn: async ({ offerId: oid, content }: { offerId: string; content: string }) => {
      const { data } = await apiClient.post(`/messages/offers/${oid}`, { content });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offerMessages', offerId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Mark offer messages as read
  useEffect(() => {
    if (!offerId || !messages?.length) return;
    const unread = messages.filter((m: any) => m.senderId !== user?.id && !m.isRead);
    if (unread.length > 0) {
      apiClient.post(`/messages/offers/${offerId}/read`).catch(() => {});
    }
  }, [offerId, messages, user?.id]);

  const handleSend = async () => {
    if (!messageText.trim() || !offerId) return;
    const text = messageText.trim();
    setMessageText('');
    try {
      await sendMessage.mutateAsync({ offerId, content: text });
    } catch {
      setMessageText(text);
    }
  };

  const renderMessage = useCallback(
    ({ item }: { item: any }) => {
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
          {!isMe && (
            <Avatar name={item.sender?.name || '?'} avatarUrl={item.sender?.avatarUrl} size={28} />
          )}
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
        </Animated.View>
      );
    },
    [user?.id, isRTL, colors]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={t('offers.negotiation', { defaultValue: 'Negotiation' })}
        onBack={goBack}
      />

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.skeletonChat}>
            {[0, 1, 2, 3].map((i) => (
              <Animated.View
                key={`skel-${i}`}
                entering={FadeIn.delay(i * 60).duration(200)}
                style={[
                  styles.skeletonRow,
                  i % 2 === 0 ? styles.skeletonRowRight : styles.skeletonRowLeft,
                ]}
              >
                {i % 2 !== 0 && <SkeletonLoader width={28} height={28} borderRadius={14} />}
                <SkeletonLoader width={i % 2 === 0 ? '55%' : '65%'} height={48} borderRadius={16} />
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
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>
                  {t('offers.startNegotiation', { defaultValue: 'Start negotiating...' })}
                </Text>
              </Animated.View>
            }
          />
        )}

        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}
        >
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={t('messages.typeMessage')}
            placeholderTextColor={colors.textSecondary}
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
            style={[
              styles.sendBtn,
              { backgroundColor: colors.primary, opacity: messageText.trim() ? 1 : 0.5 },
            ]}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  skeletonChat: { flex: 1, padding: 16, gap: 12 } as ViewStyle,
  skeletonRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 } as ViewStyle,
  skeletonRowRight: { justifyContent: 'flex-end' } as ViewStyle,
  skeletonRowLeft: { justifyContent: 'flex-start' } as ViewStyle,
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
});
