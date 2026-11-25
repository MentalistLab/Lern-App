import React, { useEffect, useId, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

interface Props {
  size: number;
  color: string;
  count?: number;
  /** Anteil des Keils am Segment (0–1). */
  wedge?: number;
  opacity?: number;
  duration?: number;
  reverse?: boolean;
  start?: number;
}

/** Rotierende Lichtstrahlen, die nach außen ausblenden. */
export function Rays({ size, color, count = 20, wedge = 0.28, opacity = 0.34, duration = 48000, reverse = false, start = 0 }: Props) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const spin = useRef(new Animated.Value(0)).current;
  const R = size / 2;

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [spin, duration]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'] });
  const step = (Math.PI * 2) / count;
  const paths = Array.from({ length: count }, (_, i) => {
    const a0 = start + i * step;
    const a1 = a0 + step * wedge;
    return `M${R} ${R} L${R + R * Math.cos(a0)} ${R + R * Math.sin(a0)} L${R + R * Math.cos(a1)} ${R + R * Math.sin(a1)} Z`;
  });

  return (
    <Animated.View pointerEvents="none" style={{ width: size, height: size, transform: [{ rotate }] }}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`${u}r`} cx={R} cy={R} r={R} gradientUnits="userSpaceOnUse">
            <Stop offset="0.04" stopColor={color} stopOpacity={opacity} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {paths.map((d, i) => (
          <Path key={i} d={d} fill={`url(#${u}r)`} />
        ))}
      </Svg>
    </Animated.View>
  );
}
