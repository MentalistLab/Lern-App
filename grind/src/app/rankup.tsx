import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Backdrop } from '../components/Backdrop';
import { Button } from '../components/Button';
import { Chamfer } from '../components/Chamfer';
import { Emblem } from '../components/Emblem';
import { Float } from '../components/Float';
import { Icon } from '../components/Icon';
import { Rays } from '../components/Rays';
import { Body, Display } from '../components/Typo';
import { formatNumber, RANKS, rankFromXp } from '../ranks';
import { useStore } from '../store';
import { colors } from '../theme';

const PARTICLE_COLORS = ['#FFD66B', '#FFFFFF', '#7DF0FF', '#FFD66B'];

function Particle({ x, y, size, color, delay, period }: { x: number; y: number; size: number; color: string; delay: number; period: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay, period]);
  const opacity = t.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [6, -10] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity,
        transform: [{ translateY }], shadowColor: color, shadowOpacity: 1, shadowRadius: size * 2, shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

/** Deterministische Partikel, damit das Layout stabil bleibt. */
function useParticles(w: number, h: number) {
  return useMemo(() => {
    let s = 7;
    const rnd = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    return Array.from({ length: 34 }, (_, i) => ({
      key: i, x: rnd() * w, y: rnd() * h * 0.92, size: 2 + rnd() * 3.2,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length], delay: rnd() * 1800, period: 1100 + rnd() * 1700,
    }));
  }, [w, h]);
}

export default function RankUp() {
  const p = useLocalSearchParams<{ subjectId: string; xpBefore: string; xpGained: string }>();
  const { subjects } = useStore();
  const insets = useSafeAreaInsets();
  const subject = subjects.find((s) => s.id === p.subjectId);
  const before = rankFromXp(Number(p.xpBefore ?? 0));
  const after = rankFromXp(Number(p.xpBefore ?? 0) + Number(p.xpGained ?? 0));
  const newRank = after.rank !== before.rank;
  const m = RANKS[after.rank];

  const pop = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(0)).current;
  const particles = useParticles(390, 844);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, friction: 4.5, tension: 55, useNativeDriver: true }),
    ]).start();
    Animated.timing(rise, { toValue: 1, duration: 800, delay: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [pop, rise]);

  if (!subject || after.step <= before.step) return <Redirect href="/home" />;

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const riseY = rise.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const gold = newRank ? '#FFD66B' : m.light;

  return (
    <View style={{ flex: 1, backgroundColor: '#050610', overflow: 'hidden' }}>
      <Backdrop base="#050610" top={colors.cyan} topOpacity={0.18} center={m.main} centerY="47%" centerOpacity={0.4} stripes={false} />

      {/* Lichtstrahlen hinter dem Emblem */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
        <View style={{ marginTop: 20 }}>
          <Rays size={980} color={gold} opacity={0.36} count={22} wedge={0.24} duration={48000} />
          <View style={{ position: 'absolute', left: 0, top: 0 }}>
            <Rays size={980} color="#FFFFFF" opacity={0.22} count={30} wedge={0.07} duration={70000} reverse start={0.1} />
          </View>
        </View>
      </View>

      {particles.map(({ key, ...q }) => (
        <Particle key={key} {...q} />
      ))}

      <View style={{ paddingTop: insets.top + 14, alignItems: 'center', gap: 8 }}>
        <Chamfer cut={8} border="rgba(255,194,51,0.55)" borderWidth={1} fill="rgba(255,194,51,0.14)"
          contentStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 28, paddingHorizontal: 14 }}>
          <Icon name={subject.icon} size={16} color="#FFD66B" />
          <Body size={12} weight="bold" color="#FFE08A" tracking={2.2}>{subject.name.toUpperCase()}</Body>
        </Chamfer>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Display
            size={newRank ? 100 : 88}
            skew={-8}
            color={gold}
            glow="rgba(255,194,51,0.9)"
            tracking={0.03}
            numberOfLines={1}
            style={{ lineHeight: newRank ? 98 : 86, paddingHorizontal: 14 }}
          >
            {newRank ? 'Rank Up' : 'Stufe Up'}
          </Display>
        </Animated.View>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Float amount={10} duration={2250}>
            <Emblem rank={after.rank} size={300} />
          </Float>
        </Animated.View>
      </View>

      <Animated.View style={{ alignItems: 'center', gap: 6, opacity: rise, transform: [{ translateY: riseY }], paddingBottom: 8 }}>
        <Display size={92} color={gold} skew={-6} glow="rgba(255,194,51,0.8)" style={{ lineHeight: 88, paddingHorizontal: 12 }}>{after.label}</Display>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Emblem rank={before.rank} size={28} locked />
          <Display size={20} color="#8D9BB5">{before.label}</Display>
          <Icon name="chevron-right" size={18} color="#FFC233" sw={3} />
          <Display size={20} color="#FFC233">{after.label}</Display>
        </View>
        {after.nextLabel ? (
          <Body size={14} weight="semi" color="#D9CFA8" style={{ marginTop: 6 }}>
            Nächstes Ziel: {after.nextLabel} · {formatNumber(after.tierXp)} XP
          </Body>
        ) : (
          <Body size={14} weight="semi" color="#D9CFA8" style={{ marginTop: 6 }}>Höchster Rang erreicht.</Body>
        )}
      </Animated.View>

      <View style={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: Math.max(insets.bottom, 14) + 20 }}>
        <Button label="Weiter grinden" variant="gold" icon="chevron-right" iconRight onPress={() => router.replace('/home')} height={60} size={28} />
      </View>
    </View>
  );
}
