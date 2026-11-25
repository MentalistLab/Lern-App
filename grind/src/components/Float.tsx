import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

/** Lässt den Inhalt sanft auf und ab schweben. */
export function Float({ children, amount = 8, duration = 2300, style }: { children: React.ReactNode; amount?: number; duration?: number; style?: StyleProp<ViewStyle> }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, duration]);
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -amount] });
  return <Animated.View style={[{ transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}
