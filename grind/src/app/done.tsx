import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Button } from '../components/Button';
import { Chamfer } from '../components/Chamfer';
import { Emblem } from '../components/Emblem';
import { Flame } from '../components/Flame';
import { Icon } from '../components/Icon';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { Body, Display, Eyebrow } from '../components/Typo';
import { formatNumber, RANKS, rankFromXp, XP_PER_MINUTE } from '../ranks';
import { clock, streaks, todaySeconds } from '../stats';
import { useStore } from '../store';
import { colors } from '../theme';

export default function Done() {
  const p = useLocalSearchParams<{ subjectId: string; seconds: string; xpBefore: string; xpGained: string }>();
  const { subjects, sessions, dailyGoalMin } = useStore();
  const subject = subjects.find((s) => s.id === p.subjectId);

  const xpGained = Number(p.xpGained ?? 0);
  const seconds = Number(p.seconds ?? 0);
  const before = rankFromXp(Number(p.xpBefore ?? 0));
  const after = rankFromXp(Number(p.xpBefore ?? 0) + xpGained);
  const rankUp = after.step > before.step;
  const newRank = after.rank !== before.rank;

  const [shown, setShown] = useState(0);
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const count = new Animated.Value(0);
    const id = count.addListener(({ value }) => setShown(Math.round(value)));
    Animated.timing(count, { toValue: xpGained, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return () => count.removeListener(id);
  }, [xpGained, pop]);

  if (!subject || !xpGained) return <Redirect href="/home" />;

  const m = RANKS[before.rank];
  const todaySec = todaySeconds(sessions);
  const todayMin = Math.floor(todaySec / 60);
  const goalReached = todaySec >= dailyGoalMin * 60;
  const st = streaks(sessions, dailyGoalMin);
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  const goUp = () =>
    router.replace({ pathname: '/rankup', params: { subjectId: subject.id, xpBefore: p.xpBefore ?? '0', xpGained: String(xpGained) } });

  return (
    <Screen
      scroll
      backdrop={{ top: colors.cyan, topOpacity: 0.3, center: rankUp ? '#FFC233' : undefined, centerY: '55%', centerOpacity: 0.12 }}
      footer={
        rankUp ? (
          <Button label="Aufstieg ansehen" variant="gold" icon="chevron-right" iconRight onPress={goUp} height={60} size={28} />
        ) : (
          <View style={{ gap: 8 }}>
            <Button label="Weiter" onPress={() => router.replace('/home')} height={58} />
            <Button label="Noch eine Runde" variant="outline" onPress={() => router.replace(`/timer/${subject.id}`)} height={52} size={22} />
          </View>
        )
      }
    >
      <View style={{ alignItems: 'center', gap: 0, paddingTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={14} color={colors.ink} sw={3.4} />
          </View>
          <Body size={13} weight="bold" color={colors.cyan} tracking={2.6}>SESSION BEENDET</Body>
        </View>
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center', marginTop: 8 }}>
          <Display size={132} skew={-6} glow="rgba(34,216,255,0.9)" style={{ lineHeight: 124, paddingHorizontal: 12 }}>+{shown}</Display>
          <Display size={44} color={colors.cyan} tracking={0.2} glow="rgba(34,216,255,0.7)" style={{ lineHeight: 44, marginTop: -2 }}>XP</Display>
        </Animated.View>
        <Body size={14} weight="semi" color="#B4C4E2" style={{ marginTop: 6 }}>
          {Math.max(1, Math.round(seconds / 60))} Minuten {subject.name}, voll fokussiert.
        </Body>
      </View>

      <Chamfer
        cut={18}
        border={[rankUp ? '#FFC233' : m.main, 'rgba(194,206,222,0.4)', colors.line]}
        fill={[colors.card, '#0A1226']}
        tint={m.main}
        style={{ marginTop: 20 }}
        contentStyle={{ padding: 14, gap: 12 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Emblem rank={before.rank} size={64} />
          <View style={{ flex: 1 }}>
            <Display size={30} numberOfLines={1}>{subject.name}</Display>
            <Display size={18} color={m.text}>{before.label}</Display>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Body size={15} weight="bold" color={colors.text}>
              {rankUp ? formatNumber(before.tierXp) : formatNumber(after.xpIntoTier)}
              <Body size={15} weight="bold" color={colors.quiet}> / {formatNumber(before.tierXp)}</Body>
            </Body>
            <Body size={11} weight="bold" color={colors.quiet} tracking={1}>XP</Body>
          </View>
        </View>

        <ProgressBar
          value={rankUp ? 1 : after.pct}
          from={before.pct}
          base={before.pct}
          colors={[m.barFrom, m.barTo]}
          height={18}
          glow={rankUp ? '#FFC233' : colors.cyan}
        />

        {rankUp ? (
          <Chamfer cut={10} border="rgba(255,194,51,0.55)" borderWidth={1} fill={['rgba(255,194,51,0.22)', 'rgba(255,194,51,0.06)']}
            contentStyle={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Emblem rank={before.rank} size={30} />
              <Icon name="chevron-right" size={16} color="#FFC233" sw={3} />
              <Emblem rank={after.rank} size={42} />
            </View>
            <View style={{ flex: 1 }}>
              <Display size={24} color="#FFC233" glow="rgba(255,194,51,0.6)">{newRank ? 'Rang-Aufstieg!' : 'Stufen-Aufstieg!'}</Display>
              <Body size={12} weight="semi" color="#E7D9A8">{after.label} erreicht</Body>
            </View>
          </Chamfer>
        ) : (
          <Body size={13} weight="semi" color={colors.muted}>
            Noch <Body size={13} weight="bold" color={colors.cyan}>{formatNumber(after.xpToNext)} XP</Body> bis {after.nextLabel}
          </Body>
        )}
      </Chamfer>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Chamfer cut={10} border={colors.line} fill="#0C1530" style={{ flex: 1 }} contentStyle={{ height: 70, padding: 10, justifyContent: 'space-between' }}>
          <Eyebrow color={colors.quiet}>ZEIT</Eyebrow>
          <Display size={30}>{clock(seconds)}</Display>
        </Chamfer>
        <Chamfer cut={10} border={colors.line} fill="#0C1530" style={{ flex: 1 }} contentStyle={{ height: 70, padding: 10, justifyContent: 'space-between' }}>
          <Eyebrow color={colors.quiet}>XP / MIN</Eyebrow>
          <Display size={30} color={colors.cyan}>{XP_PER_MINUTE}</Display>
        </Chamfer>
        <Chamfer cut={10} border={goalReached ? [colors.cyan, colors.line] : colors.line} fill={goalReached ? '#0C1A38' : '#0C1530'} style={{ flex: 1 }}
          contentStyle={{ height: 70, padding: 10, justifyContent: 'space-between' }}>
          <Eyebrow color={colors.quiet}>TAGESZIEL</Eyebrow>
          <Display size={30}>{todayMin}<Display size={16} color={colors.quiet}> / {dailyGoalMin}</Display></Display>
        </Chamfer>
      </View>

      <Chamfer cut={12} border={[colors.flame, 'rgba(255,138,31,0.2)', colors.line]} fill={[colors.card, '#0A1226']} tint={colors.flame} tintX={0.1} style={{ marginTop: 12 }}
        contentStyle={{ height: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12, paddingRight: 16 }}>
        <Flame size={38} lit={st.current > 0} />
        <Display size={44} glow="rgba(255,138,31,0.7)">{st.current}</Display>
        <View style={{ flex: 1 }}>
          <Display size={20} style={{ lineHeight: 22 }}>{st.current === 1 ? 'Tag Streak' : 'Tage Streak'}</Display>
          <Body size={12} weight="semi" color={colors.flameSoft}>
            {goalReached ? 'Tagesziel heute geschafft' : `Noch ${Math.max(1, dailyGoalMin - todayMin)} Min bis zum Tagesziel`}
          </Body>
        </View>
      </Chamfer>
    </Screen>
  );
}
