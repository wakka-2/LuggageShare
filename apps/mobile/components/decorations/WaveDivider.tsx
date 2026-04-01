import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { V2_COLORS } from '@/providers/ThemeProvider';

interface WaveDividerProps {
  color?: 'primary' | 'mint' | 'warm' | 'cool';
  flip?: boolean;
  height?: number;
  style?: ViewStyle;
}

const COLOR_MAP = {
  primary: { start: V2_COLORS.primaryMid + '20', end: V2_COLORS.primaryLight + '08' },
  mint: { start: V2_COLORS.accent1 + '25', end: V2_COLORS.accent3 + '08' },
  warm: { start: V2_COLORS.accent2 + '25', end: V2_COLORS.secondary + '10' },
  cool: { start: V2_COLORS.accent3 + '20', end: V2_COLORS.primaryMid + '08' },
};

export function WaveDivider({
  color = 'primary',
  flip = false,
  height = 32,
  style,
}: WaveDividerProps) {
  const colors = COLOR_MAP[color];

  return (
    <View style={[{ height, marginVertical: 4 }, flip && { transform: [{ scaleY: -1 }] }, style]}>
      <Svg width="100%" height={height} viewBox="0 0 400 32" preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.start} />
            <Stop offset="0.5" stopColor={colors.end} />
            <Stop offset="1" stopColor={colors.start} />
          </SvgGradient>
        </Defs>
        <Path
          d="M0,16 C50,2 100,28 150,16 C200,4 250,28 300,16 C350,4 400,20 400,16 L400,32 L0,32 Z"
          fill="url(#waveGrad)"
        />
        <Path
          d="M0,20 C60,10 120,30 180,20 C240,10 300,26 360,18 C380,14 400,20 400,20 L400,32 L0,32 Z"
          fill={colors.start}
          opacity={0.4}
        />
      </Svg>
    </View>
  );
}
