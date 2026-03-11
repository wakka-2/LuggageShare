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
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  V2_COLORS,
  RADIUS,
  BUBBLE_SHADOWS,
  GRADIENTS,
  TYPOGRAPHY,
} from '@/providers/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useOffer, useAcceptOffer, useRejectOffer, useWithdrawOffer } from '@/hooks/useOffers';
import { useOfferSocket } from '@/hooks/useOfferSocket';
import { Avatar } from '@/components/common';
import { SkeletonLoader } from '@/components/animations';
import apiClient from '@/lib/api';

interface OfferMessage {
  id: string;
  offerId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatarUrl: string | null };
}

function useOfferMessages(offerId: string | null) {
  return useQuery<OfferMessage[]>({
    queryKey: ['offerMessages', offerId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/messages/offers/${offerId}`);
      return data.data?.messages ?? data.messages ?? data.data ?? data;
    },
    enabled: !!offerId,
    refetchInterval: 5000,
  });
}

function useSendOfferMessage(offerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await apiClient.post(`/messages/offers/${offerId}`, { content });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offerMessages', offerId] });
    },
  });
}

function useMarkOfferMessagesRead(offerId: string) {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post(`/messages/offers/${offerId}/read`);
    },
  });
}

export default function OfferChatScreen() {
  const { offerId } = useLocalSearchParams<{ offerId: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState('');

  const { data: offer, isLoading: offerLoading } = useOffer(offerId ?? null);
  const { data: messages, isLoading: messagesLoading } = useOfferMessages(offerId ?? null);
  const sendMessage = useSendOfferMessage(offerId ?? '');
  const markRead = useMarkOfferMessagesRead(offerId ?? '');
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();
  const withdrawOffer = useWithdrawOffer();
  const {
    isConnected,
    sendMessage: socketSend,
    sendTyping,
    isOtherTyping,
  } = useOfferSocket(offerId);

  // Mark as read on enter
  const lastReadCount = useRef(0);
  useEffect(() => {
    if (!offerId || !messages?.length) return;
    const unread = messages.filter((m) => m.senderId !== user?.id && !m.isRead);
    if (unread.length > 0 && unread.length !== lastReadCount.current) {
      lastReadCount.current = unread.length;
      markRead.mutate();
    }
  }, [offerId, messages]);

  const handleSend = async () => {
    if (!messageText.trim() || !offerId) return;
    const text = messageText.trim();
    setMessageText('');

    // Try WebSocket first
    if (isConnected) {
      socketSend(text);
      // Optimistic: refetch shortly
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ['offerMessages', offerId] }),
        500
      );
    } else {
      try {
        await sendMessage.mutateAsync(text);
      } catch {
        setMessageText(text);
      }
    }
  };

  const handleAccept = () => {
    if (!offer) return;
    Alert.alert(
      t('offer.acceptTitle', { defaultValue: 'Accept Offer' }),
      t('offer.acceptConfirm', {
        defaultValue: `Accept ${Number(offer.offeredWeight)} kg for ${Number(offer.offeredPrice)} ${offer.currency}? A booking will be created automatically.`,
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('offer.acceptBtn', { defaultValue: 'Accept' }),
          onPress: async () => {
            try {
              await acceptOffer.mutateAsync(offer.id);
              Alert.alert(
                t('offer.acceptedTitle', { defaultValue: 'Offer Accepted!' }),
                t('offer.acceptedDescription', {
                  defaultValue: 'A booking has been created. You can find it in My Trips.',
                }),
                [{ text: t('common.ok'), onPress: () => router.push('/(tabs)/trips') }]
              );
            } catch (e: any) {
              Alert.alert(t('common.errorTitle'), e?.response?.data?.message || t('common.error'));
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    if (!offer) return;
    Alert.alert(
      t('offer.rejectTitle', { defaultValue: 'Reject Offer' }),
      t('offer.rejectConfirm', { defaultValue: 'Are you sure you want to reject this offer?' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('offer.rejectBtn', { defaultValue: 'Reject' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectOffer.mutateAsync(offer.id);
              router.back();
            } catch (e: any) {
              Alert.alert(t('common.errorTitle'), e?.response?.data?.message || t('common.error'));
            }
          },
        },
      ]
    );
  };

  const handleWithdraw = () => {
    if (!offer) return;
    Alert.alert(
      t('offer.withdrawTitle', { defaultValue: 'Withdraw Offer' }),
      t('offer.withdrawConfirm', {
        defaultValue: 'Withdraw your offer? You can submit a new one later.',
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('offer.withdrawBtn', { defaultValue: 'Withdraw' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawOffer.mutateAsync(offer.id);
              router.back();
            } catch (e: any) {
              Alert.alert(t('common.errorTitle'), e?.response?.data?.message || t('common.error'));
            }
          },
        },
      ]
    );
  };

  const isLoading = offerLoading || messagesLoading;
  const isFlightPoster = offer && user?.id === offer.flight?.poster?.id;
  const isOfferSender = offer && user?.id === offer.senderId;
  const isPending = offer?.status === 'pending';

  const renderMessage = useCallback(
    ({ item }: { item: OfferMessage }) => {
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {offer
              ? `${offer.flight.departureCity} → ${offer.flight.arrivalCity}`
              : t('offer.chat', { defaultValue: 'Offer Chat' })}
          </Text>
          {offer && (
            <View style={styles.offerSummaryRow}>
              <Text style={styles.offerSummaryText}>
                {Number(offer.offeredWeight)} kg · {Number(offer.offeredPrice)} {offer.currency}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isPending ? '#FFBE5C20' : '#56D8B120' },
                ]}
              >
                <Text
                  style={[styles.statusBadgeText, { color: isPending ? '#FFBE5C' : '#56D8B1' }]}
                >
                  {offer.status}
                </Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Accept/Reject/Withdraw action strip for pending offers */}
      {offer && isPending && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.actionStrip}>
          {isFlightPoster && (
            <>
              <TouchableOpacity
                onPress={handleAccept}
                style={styles.acceptBtn}
                disabled={acceptOffer.isPending}
              >
                <Ionicons name="checkmark" size={16} color="#FFF" />
                <Text style={styles.acceptBtnText}>
                  {t('offer.accept', { defaultValue: 'Accept' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReject}
                style={styles.rejectBtn}
                disabled={rejectOffer.isPending}
              >
                <Ionicons name="close" size={16} color="#FF6B9D" />
                <Text style={styles.rejectBtnText}>
                  {t('offer.reject', { defaultValue: 'Reject' })}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {isOfferSender && (
            <TouchableOpacity
              onPress={handleWithdraw}
              style={styles.withdrawBtn}
              disabled={withdrawOffer.isPending}
            >
              <Ionicons name="return-up-back" size={16} color={V2_COLORS.textSoft} />
              <Text style={styles.withdrawBtnText}>
                {t('offer.withdraw', { defaultValue: 'Withdraw' })}
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.offerDetailChip}>
            <Ionicons name="scale" size={14} color={V2_COLORS.primary} />
            <Text style={styles.offerDetailText}>{Number(offer.offeredWeight)} kg</Text>
          </View>
          <View style={styles.offerDetailChip}>
            <Ionicons name="pricetag" size={14} color={V2_COLORS.accent2} />
            <Text style={styles.offerDetailText}>
              {Number(offer.offeredPrice)} {offer.currency}
            </Text>
          </View>
        </Animated.View>
      )}

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
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            maxToRenderPerBatch={15}
            windowSize={10}
            removeClippedSubviews
            ListEmptyComponent={
              <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={48} color={V2_COLORS.textMuted} />
                <Text style={styles.emptyChatText}>
                  {t('chat.startConversation', { defaultValue: 'Start the conversation' })}
                </Text>
                {offer?.note && (
                  <View style={styles.notePreview}>
                    <Text style={styles.notePreviewLabel}>
                      {t('offer.senderNote', { defaultValue: "Sender's note:" })}
                    </Text>
                    <Text style={styles.notePreviewText}>{offer.note}</Text>
                  </View>
                )}
              </Animated.View>
            }
          />
        )}

        <Animated.View entering={SlideInDown.duration(300).springify()} style={styles.inputBar}>
          {isOtherTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>
                {t('chat.typing', { defaultValue: 'Typing...' })}
              </Text>
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
              placeholder={t('messages.typeMessage', { defaultValue: 'Type a message...' })}
              placeholderTextColor={V2_COLORS.textMuted}
              multiline
              maxLength={1000}
              textAlign={isRTL ? 'right' : 'left'}
              editable={isPending || !offer}
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
              disabled={!messageText.trim() || sendMessage.isPending || (!isPending && !!offer)}
              style={{ opacity: messageText.trim() && (isPending || !offer) ? 1 : 0.4 }}
            >
              <LinearGradient colors={[...GRADIENTS.primary]} style={styles.sendBtn}>
                <Ionicons name="send" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {offer && !isPending && (
            <Text style={styles.closedNote}>
              {t('offer.chatClosed', { defaultValue: `Offer ${offer.status} — chat is read-only` })}
            </Text>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: V2_COLORS.bg } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,

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
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 } as ViewStyle,
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: V2_COLORS.text,
    textAlign: 'center',
  } as TextStyle,
  offerSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  } as ViewStyle,
  offerSummaryText: { fontSize: 12, color: V2_COLORS.textMuted } as TextStyle,
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.pill } as ViewStyle,
  statusBadgeText: { fontSize: 11, fontWeight: '700' } as TextStyle,

  // Action strip
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.sm,
    flexWrap: 'wrap',
  } as ViewStyle,
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: '#56D8B1',
  } as ViewStyle,
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' } as TextStyle,
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: '#FF6B9D',
  } as ViewStyle,
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: '#FF6B9D' } as TextStyle,
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: V2_COLORS.textMuted,
  } as ViewStyle,
  withdrawBtnText: { fontSize: 13, fontWeight: '600', color: V2_COLORS.textSoft } as TextStyle,
  offerDetailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: V2_COLORS.bg,
  } as ViewStyle,
  offerDetailText: { fontSize: 12, fontWeight: '600', color: V2_COLORS.text } as TextStyle,

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
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 20 } as ViewStyle,
  bubbleMe: { borderBottomRightRadius: 6 } as ViewStyle,
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
    paddingTop: 80,
    gap: 12,
  } as ViewStyle,
  emptyChatText: { fontSize: 16, color: V2_COLORS.textMuted } as TextStyle,
  notePreview: {
    backgroundColor: V2_COLORS.accent2 + '12',
    borderRadius: RADIUS.card,
    padding: 14,
    marginTop: 12,
    maxWidth: '80%',
  } as ViewStyle,
  notePreviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: V2_COLORS.accent2,
    marginBottom: 4,
  } as TextStyle,
  notePreviewText: { fontSize: 14, color: V2_COLORS.text, lineHeight: 20 } as TextStyle,

  inputBar: {
    padding: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    ...BUBBLE_SHADOWS.md,
  } as ViewStyle,
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 } as ViewStyle,
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
  closedNote: {
    fontSize: 12,
    color: V2_COLORS.textMuted,
    textAlign: 'center',
    paddingTop: 6,
  } as TextStyle,
});
