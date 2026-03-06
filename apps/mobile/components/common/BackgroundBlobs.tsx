import { StyleSheet, Dimensions } from 'react-native';
import { View } from 'react-native';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { V2_COLORS } from '@/providers/ThemeProvider';

const { width: SCREEN_W } = Dimensions.get('window');

interface BackgroundBlobsProps {
  variant?: 'full' | 'subtle';
  height?: number;
}

export function BackgroundBlobs({ variant = 'full', height = 900 }: BackgroundBlobsProps) {
  if (variant === 'subtle') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={SCREEN_W} height={height} style={StyleSheet.absoluteFill}>
          <Circle cx={SCREEN_W - 30} cy={120} r={100} fill={V2_COLORS.blob1} opacity={0.4} />
          <Ellipse cx={-10} cy={350} rx={80} ry={100} fill={V2_COLORS.blob3} opacity={0.3} />
          <Circle cx={SCREEN_W - 60} cy={600} r={70} fill={V2_COLORS.blob4} opacity={0.2} />
        </Svg>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={SCREEN_W} height={height} style={StyleSheet.absoluteFill}>
        <Circle cx={SCREEN_W - 30} cy={80} r={140} fill={V2_COLORS.blob1} opacity={0.6} />
        <Ellipse cx={-20} cy={200} rx={100} ry={120} fill={V2_COLORS.blob2} opacity={0.5} />
        <Circle cx={SCREEN_W + 20} cy={420} r={100} fill={V2_COLORS.blob3} opacity={0.5} />
        <Ellipse cx={40} cy={650} rx={160} ry={130} fill={V2_COLORS.blob4} opacity={0.4} />
        <Circle cx={SCREEN_W - 80} cy={750} r={60} fill={V2_COLORS.blob1} opacity={0.3} />
      </Svg>
    </View>
  );
}
