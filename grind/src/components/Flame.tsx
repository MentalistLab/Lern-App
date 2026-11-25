import React, { useEffect, useId, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

const OUTER =
  'M34 2 C36 16 54 26 54 48 C54 64 44 76 32 76 C20 76 10 65 10 50 C10 38 16 32 22 24 C23 30 27 33 30 32 C33 24 30 12 34 2 Z';
const MID =
  'M32 28 C34 38 44 42 44 54 C44 64 38 70 32 70 C26 70 20 64 20 55 C20 48 24 44 27 40 C28 44 30 45 31 44 C32 40 31 34 32 28 Z';
const CORE = 'M32 50 C34 55 38 57 38 62 C38 67 35 69 32 69 C29 69 26 67 26 62 C26 58 29 55 32 50 Z';

/** Streak-Flamme. `size` ist die Breite, die Höhe ist 1,25 × Breite. */
export function Flame({ size = 48, lit = true, animated = true }: { size?: number; lit?: boolean; animated?: boolean }) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lit || !animated) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lit, animated, t]);

  const scaleY = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const scaleX = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-1.5deg'] });

  return (
    <Animated.View
      style={{ width: size, height: size * 1.25, transformOrigin: '50% 95%', transform: [{ scaleX }, { scaleY }, { rotate }] }}
    >
      <Svg width={size} height={size * 1.25} viewBox="0 0 64 80" style={{ overflow: 'visible' }}>
        {lit ? (
          <>
            <Defs>
              <RadialGradient id={`${u}g`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FF8A1F" stopOpacity={0.6} />
                <Stop offset="1" stopColor="#FF8A1F" stopOpacity={0} />
              </RadialGradient>
              <LinearGradient id={`${u}o`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FF3D1F" />
                <Stop offset="1" stopColor="#FF9A1F" />
              </LinearGradient>
              <LinearGradient id={`${u}m`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FF9A1F" />
                <Stop offset="1" stopColor="#FFD36B" />
              </LinearGradient>
            </Defs>
            <Ellipse cx="32" cy="50" rx="40" ry="38" fill={`url(#${u}g)`} />
            <Path d={OUTER} fill={`url(#${u}o)`} />
            <Path d={MID} fill={`url(#${u}m)`} />
            <Path d={CORE} fill="#FFF4C8" />
          </>
        ) : (
          <>
            <Path d={OUTER} fill="#16234A" stroke="#3A4C78" strokeWidth={2.5} strokeLinejoin="round" />
            <Path d={CORE} fill="#3A4C78" />
          </>
        )}
      </Svg>
    </Animated.View>
  );
}
