import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Button, IconButton } from '../../components/Button';
import { Chamfer } from '../../components/Chamfer';
import { Emblem } from '../../components/Emblem';
import { Float } from '../../components/Float';
import { Icon } from '../../components/Icon';
import { ProgressBar } from '../../components/ProgressBar';
import { Rays } from '../../components/Rays';
import { Screen } from '../../components/Screen';
import { Body, Display, Eyebrow } from '../../components/Typo';
import { formatNumber, RANKS, rankFromXp } from '../../ranks';
import { formatDuration, subjectXp, todayIndex, weekMinutes, WEEKDAYS } from '../../stats';
import { useStore } from '../../store';
import { colors, withAlpha } from '../../theme';

export default function SubjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subjects, sessions } = useStore();
  const subject = subjects.find((s) => s.id === id);
  if (!subject) return <Redirect href="/home" />;

  const xp = subjectXp(sessions, subject.id);
  const r = rankFromXp(xp);
  const m = RANKS[r.rank];
  const week = weekMinutes(sessions, subject.id);
  const weekTotal = week.reduce((a, b) => a + b, 0);
  const wt = formatDuration(weekTotal * 60);
  const today = todayIndex();
  const maxMin = Math.max(60, ...week);
  const champion = r.rank === 'champion';

  return (
    <Screen
      scroll
      backdrop={{ top: m.main, topOpacity: 0.18, center: m.main, centerY: '24%', centerOpacity: 0.16 }}
      footer={<Button label="Fokus starten" icon="play" onPress={() => router.push(`/timer/${subject.id}`)} height={60} size={28} />}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton icon="chevron-left" label="Zurück" onPress={() => router.back()} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <Icon name={subject.icon} size={20} color={subject.color} />
          <Display size={30} numberOfLines={1} style={{ flexShrink: 1 }}>{subject.name}</Display>
        </View>
        <IconButton icon="pencil" label="Fach bearbeiten" onPress={() => router.push({ pathname: '/subject-form', params: { id: subject.id } })} />
      </View>

      <View style={{ alignItems: 'center', marginTop: 8, height: 238, justifyContent: 'center' }}>
        <View style={{ position: 'absolute' }} pointerEvents="none">
          <Rays size={470} color={m.light} opacity={0.2} count={26} wedge={0.3} duration={70000} />
        </View>
        <Float amount={6} duration={2500}><Emblem rank={r.rank} size={214} /></Float>
      </View>

      <View style={{ alignItems: 'center', marginTop: -4 }}>
        <Display size={64} color={m.light} skew={-6} glow={withAlpha(m.main, 0.65)} style={{ paddingHorizontal: 8, lineHeight: 64 }}>{r.label}</Display>
        <Body size={12} weight="bold" color={colors.muted} tracking={1.9}>RANG {RANK_INDEX[r.rank]} VON 7</Body>
      </View>

      <Chamfer cut={16} border={[m.main, 'rgba(34,216,255,0.35)', colors.line]} fill={[colors.card, '#0A1226']} style={{ marginTop: 16 }}
        contentStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 10 }}>
        {champion ? (
          <>
            <Display size={24} color={m.text}>Höchster Rang erreicht</Display>
            <Body size={14} color={colors.text2}>{formatNumber(xp)} XP gesammelt. Mehr Fokus hält dich an der Spitze.</Body>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {[1, 2, 3].map((t) => (
                  <View key={t} style={{
                    width: 12, height: 12, transform: [{ rotate: '45deg' }],
                    backgroundColor: t < r.tier ? m.main : t === r.tier ? colors.cyan : colors.line,
                    shadowColor: colors.cyan, shadowOpacity: t === r.tier ? 0.9 : 0, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
                  }} />
                ))}
                <Body size={12} weight="bold" color={colors.muted} tracking={1.4} style={{ marginLeft: 8 }}>STUFE {['', 'I', 'II', 'III'][r.tier]}</Body>
              </View>
              <Body size={15} weight="bold" color={colors.text}>
                {formatNumber(r.xpIntoTier)}<Body size={15} weight="bold" color={colors.quiet}> / {formatNumber(r.tierXp)} XP</Body>
              </Body>
            </View>
            <ProgressBar value={r.pct} colors={[m.barFrom, m.barTo]} glow={m.main} height={14} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Body size={14} weight="semi" color="#B4C4E2">
                Noch <Body size={14} weight="bold" color={colors.cyan}>{formatNumber(r.xpToNext)} XP</Body> bis
              </Body>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {r.nextIsNewRank && r.nextRank ? <Emblem rank={r.nextRank} size={34} /> : null}
                <Display size={24} color={r.nextRank ? RANKS[r.nextRank].text : m.text}>{r.nextLabel}</Display>
              </View>
            </View>
          </>
        )}
      </Chamfer>

      <Chamfer cut={16} border={colors.line} fill={['#0E1832', '#09101F']} style={{ marginTop: 12 }} contentStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Eyebrow>DIESE WOCHE</Eyebrow>
          <Body size={15} weight="bold" color={colors.text}>{wt.h > 0 ? `${wt.h} Std ${wt.m} Min` : `${wt.m} Min`}</Body>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 110 }}>
          {week.map((min, i) => {
            const isToday = i === today;
            const future = i > today;
            const h = min > 0 ? Math.max(6, (min / maxMin) * 70) : 4;
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                <Body size={11} weight={isToday ? 'bold' : 'semi'} color={min > 0 ? (isToday ? colors.cyan : colors.muted) : 'transparent'}>{min}</Body>
                <View style={{
                  width: '100%', maxWidth: 30, height: h,
                  backgroundColor: min > 0 ? (isToday ? colors.cyan : '#8796B2') : colors.track,
                  opacity: future ? 0.6 : 1,
                  shadowColor: colors.cyan, shadowOpacity: isToday && min > 0 ? 0.8 : 0, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
                }} />
                <Body size={11} weight={isToday ? 'bold' : 'semi'} color={isToday ? colors.cyan : colors.quiet}>{WEEKDAYS[i]}</Body>
              </View>
            );
          })}
        </View>
      </Chamfer>
    </Screen>
  );
}

const RANK_INDEX: Record<string, number> = { bronze: 1, silber: 2, gold: 3, platin: 4, diamant: 5, master: 6, champion: 7 };
