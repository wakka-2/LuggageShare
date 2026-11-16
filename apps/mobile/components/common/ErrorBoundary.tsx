import React, { Component, ErrorInfo, ReactNode } from 'react';
import i18n from '@/i18n';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Sentry from '@/lib/sentry';
import { V2_COLORS, themed } from '@/providers/ThemeProvider';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>{i18n.t('common.somethingWentWrong')}</Text>
          <Text style={styles.message}>{i18n.t('common.unexpectedError')}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>{i18n.t('common.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = themed(() =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: V2_COLORS.surfaceAlt,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: V2_COLORS.text,
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      color: V2_COLORS.textSoft,
      textAlign: 'center',
      marginBottom: 24,
    },
    button: {
      backgroundColor: '#10B981',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  })
);
