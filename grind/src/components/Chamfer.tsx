import React, { useId, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Polygon, RadialGradient, Stop } from 'react-native-svg';

type Fill = string | string[];

export interface ChamferProps {
  /** Größe des Eckschnitts (oben links und unten rechts). */
  cut?: number;
  borderWidth?: number;
  border?: Fill;
  fill?: Fill;
  /** Farbiger Schimmer links im Hintergrund (z. B. Rangfarbe). */
  tint?: string;
  tintX?: number;
  /** Glow-Farbe (iOS/Web). */
  glow?: string;
  glowRadius?: number;
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean; checked?: boolean };
  children?: React.ReactNode;
}

const list = (f: Fill) => (Array.isArray(f) ? f : [f]);

/**
 * Halbtransparente Verlaufsfarben (rgba) werden auf dem Web nicht zuverlässig gerendert.
 * Darum mischen wir sie fest gegen den dunklen Grund (#0A1228) zu einer deckenden Farbe.
 */
const BASE = [10, 18, 40];
const split = (c: string) => {
  const m = c.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
  if (!m) return { color: c, opacity: 1 };
  const a = parseFloat(m[4]);
  const mix = (v: string, i: number) => Math.round(Number(v) * a + BASE[i] * (1 - a));
  return { color: `rgb(${mix(m[1], 0)},${mix(m[2], 1)},${mix(m[3], 2)})`, opacity: 1 };
};

const pts = (x0: number, y0: number, x1: number, y1: number, c: number) =>
  `${x0 + c},${y0} ${x1},${y0} ${x1},${y1 - c} ${x1 - c},${y1} ${x0},${y1} ${x0},${y0 + c}`;

/**
 * Eckig geschnittene Fläche mit Verlauf-Rahmen (React Native kennt kein clip-path,
 * deshalb wird der Hintergrund als SVG-Polygon hinter den Inhalt gelegt).
 */
export function Chamfer({
  cut = 12, borderWidth = 1.5, border = '#1F2F5C', fill = '#0A1228', tint, tintX = 0.14, glow,
  glowRadius = 14, vertical = false, style, contentStyle, onPress, disabled, accessibilityLabel,
  accessibilityState, children,
}: ChamferProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (Math.abs(s.w - width) < 0.5 && Math.abs(s.h - height) < 0.5 ? s : { w: width, h: height }));
  };

  const { w, h } = size;
  const b = borderWidth;
  const borders = list(border);
  const fills = list(fill);

  const glowStyle: ViewStyle | undefined = glow
    ? { shadowColor: glow, shadowOpacity: 0.6, shadowRadius: glowRadius, shadowOffset: { width: 0, height: 0 } }
    : undefined;

  const bg =
    w > 0 ? (
      <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id={`${uid}b`} x1="0" y1="0" x2="1" y2="1">
            {borders.map((c, i) => {
              const { color, opacity } = split(c);
              return <Stop key={i} offset={borders.length === 1 ? 0 : i / (borders.length - 1)} stopColor={color} stopOpacity={opacity} />;
            })}
          </LinearGradient>
          <LinearGradient id={`${uid}f`} x1="0" y1="0" x2={vertical ? '0' : '1'} y2="1">
            {fills.map((c, i) => {
              const { color, opacity } = split(c);
              return <Stop key={i} offset={fills.length === 1 ? 0 : i / (fills.length - 1)} stopColor={color} stopOpacity={opacity} />;
            })}
          </LinearGradient>
          {tint ? (
            <RadialGradient id={`${uid}t`} cx={w * tintX} cy={h / 2} rx={Math.max(h * 1.3, 90)} ry={h * 0.9} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={tint} stopOpacity={0.3} />
              <Stop offset="1" stopColor={tint} stopOpacity={0} />
            </RadialGradient>
          ) : null}
        </Defs>
        {b > 0 ? <Polygon points={pts(0, 0, w, h, cut)} fill={`url(#${uid}b)`} /> : null}
        <Polygon points={pts(b, b, w - b, h - b, Math.max(0, cut - b * 0.4))} fill={`url(#${uid}f)`} />
        {tint ? <Polygon points={pts(b, b, w - b, h - b, Math.max(0, cut - b * 0.4))} fill={`url(#${uid}t)`} /> : null}
      </Svg>
    ) : null;

  const inner = (
    <>
      {bg}
      <View style={contentStyle}>{children}</View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onLayout={onLayout}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        style={({ pressed }) => [glowStyle, style, { opacity: pressed ? 0.82 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
      >
        {inner}
      </Pressable>
    );
  }
  return (
    <View onLayout={onLayout} style={[glowStyle, style]}>
      {inner}
    </View>
  );
}
