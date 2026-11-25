import React, { useEffect, useId, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  /** Ziel (0–1). */
  value: number;
  /** Startwert der Animation; ohne Angabe springt der Balken nicht. */
  from?: number;
  /** Bis hierhin gilt "alter" Fortschritt, der Rest bis `value` wird als neuer Anteil hervorgehoben. */
  base?: number;
  colors?: [string, string];
  newColors?: [string, string];
  height?: number;
  glow?: string;
  duration?: number;
  delay?: number;
  track?: string;
}

function Grad({ id, c }: { id: string; c: [string, string] }) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <Stop offset="0" stopColor={c[0]} />
      <Stop offset="1" stopColor={c[1]} />
    </LinearGradient>
  );
}

/** XP-Balken mit optionaler Animation und hervorgehobenem Zuwachs. */
export function ProgressBar({
  value, from, base, colors: c = [colors.cyanDeep, colors.cyanHi], newColors = ['#7DF0FF', '#FFFFFF'],
  height = 8, glow, duration = 1100, delay = 250, track = colors.track,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const anim = useRef(new Animated.Value(from ?? value)).current;

  useEffect(() => {
    if (from === undefined) {
      anim.setValue(value);
      return;
    }
    anim.setValue(from);
    const a = Animated.timing(anim, {
      toValue: value, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [value, from, duration, delay, anim]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp' });
  const baseWidth = base !== undefined ? `${Math.min(1, Math.max(0, base)) * 100}%` : null;
  const glowStyle = glow
    ? { shadowColor: glow, shadowOpacity: 0.7, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }
    : undefined;

  return (
    <View style={[{ height, backgroundColor: track, overflow: 'hidden' }, glowStyle]} accessibilityRole="progressbar">
      <Animated.View style={[StyleSheet.absoluteFill, { width, right: undefined }]}>
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 10">
          <Defs>
            <Grad id={`${uid}n`} c={base !== undefined ? newColors : c} />
          </Defs>
          <Rect x="0" y="0" width="100" height="10" fill={`url(#${uid}n)`} />
        </Svg>
      </Animated.View>
      {baseWidth ? (
        <View style={[StyleSheet.absoluteFill, { width: baseWidth as `${number}%`, right: undefined }]}>
          <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 10">
            <Defs>
              <Grad id={`${uid}o`} c={c} />
            </Defs>
            <Rect x="0" y="0" width="100" height="10" fill={`url(#${uid}o)`} />
          </Svg>
        </View>
      ) : null}
    </View>
  );
}
