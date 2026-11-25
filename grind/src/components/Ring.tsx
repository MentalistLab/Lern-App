import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  size: number;
  progress: number;
  stroke?: number;
  from?: string;
  to?: string;
  glow?: boolean;
  children?: React.ReactNode;
}

/** Ring-Fortschritt, z. B. fürs Tagesziel. */
export function Ring({ size, progress, stroke = 7, from = colors.cyan, to = colors.blue, glow = true, children }: Props) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <View
      style={{
        width: size, height: size, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={`${u}g`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.track} strokeWidth={stroke} />
        {p > 0 && glow ? (
          <Circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={from} strokeOpacity={0.2} strokeWidth={stroke * 2.2} strokeLinecap="round"
            strokeDasharray={`${c * p} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
        {p > 0 ? (
          <Circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${u}g)`} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${c * p} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}
