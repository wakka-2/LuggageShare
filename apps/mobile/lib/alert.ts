import { Alert, Platform } from 'react-native';

type AlertButton = {
  text: string;
  style?: 'cancel' | 'destructive' | 'default';
  onPress?: () => void;
};

/**
 * Cross-platform alert that works on both web and native.
 *
 * On web, Alert.alert() is a no-op, so we fall back to
 * window.alert / window.confirm.
 */
export function showAlert(
  title: string,
  message: string,
  buttonsOrOnOk?: AlertButton[] | (() => void)
) {
  const buttons =
    typeof buttonsOrOnOk === 'function' ? [{ text: 'OK', onPress: buttonsOrOnOk }] : buttonsOrOnOk;
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmBtn = buttons.find((b) => b.style !== 'cancel');
      const ok = window.confirm(`${title}\n\n${message}`);
      if (ok && confirmBtn?.onPress) {
        confirmBtn.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
      buttons?.[0]?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}
