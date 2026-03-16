import { useState, type ReactNode } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { usePathname } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useAuth } from '@/hooks/useAuth';
import { V2_COLORS } from '@/providers/ThemeProvider';
import {
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  TOPBAR_HEIGHT,
  WEB_DESKTOP_BREAKPOINT,
  webTransition,
} from './styles';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface WebShellProps {
  children: ReactNode;
}

export function WebShell({ children }: WebShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const isDesktop = width >= WEB_DESKTOP_BREAKPOINT;

  // Don't wrap auth screens or narrow viewports — render children directly
  // (narrow web viewports use the native bottom-tab layout instead)
  if (!isAuthenticated || !isDesktop) {
    return <>{children}</>;
  }

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <View style={styles.shell}>
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />

      {/* Top bar */}
      <TopBar sidebarCollapsed={sidebarCollapsed} />

      {/* Main content */}
      <View
        style={[
          styles.content,
          webTransition('margin-inline-start'),
          { marginStart: sidebarWidth, marginTop: TOPBAR_HEIGHT } as any,
        ]}
      >
        <Animated.View key={pathname} entering={FadeIn.duration(250)} style={styles.pageWrapper}>
          {children}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: V2_COLORS.bg,
  },
  content: {
    flex: 1,
    minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)` as any,
  },
  pageWrapper: {
    flex: 1,
  },
});
