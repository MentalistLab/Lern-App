import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chamfer } from '../components/Chamfer';
import { Emblem } from '../components/Emblem';
import { Flame } from '../components/Flame';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/Button';
import { Body, Display, Eyebrow } from '../components/Typo';
import { formatNumber, RANKS, rankFromXp } from '../ranks';
import { formatDuration, heatmap, streaks, subjectXp, totalSeconds, totalXp } from '../stats';
import { useStore } from '../store';
import { colors, DAILY_GOALS, withAlpha } from '../theme';

const HEAT = [colors.track, 'rgba(34,216,255,0.28)', 'rgba(34,216,255,0.6)', colors.cyan];

export function ProfileTab() {
  const { subjects, sessions, dailyGoalMin, userName, setDailyGoal, setUserName, resetAll } = useStore();
  const insets = useSafeAreaInsets();
  const [editName, setEditName] = useState(false);
  const [editGoal, setEditGoal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [heatW, setHeatW] = useState(320);

  const { h, m } = formatDuration(totalSeconds(sessions));
  const st = streaks(sessions, dailyGoalMin);
  const ranked = subjects
    .map((s) => ({ s, xp: subjectXp(sessions, s.id), sec: sessions.filter((x) => x.subjectId === s.id).reduce((a, x) => a + x.seconds, 0) }))
    .sort((a, b) => b.xp - a.xp);
  const best = ranked[0] && ranked[0].xp > 0 ? ranked[0] : null;
  const bestRank = best ? rankFromXp(best.xp) : null;
  const maxSec = Math.max(1, ...ranked.map((r) => r.sec));
  const heat = heatmap(sessions, dailyGoalMin);
  const cell = (heatW - 13 * 4) / 14;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingHorizontal: 18, paddingBottom: 20, gap: 12 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 62, height: 62, shadowColor: colors.cyan, shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } }}>
          <Chamfer cut={16} borderWidth={0} fill={['#7DF0FF', '#22D8FF', '#2F6BFF']} contentStyle={{ width: 62, height: 62, alignItems: 'center', justifyContent: 'center' }}>
            <Display size={36} color={colors.ink} tabular={false}>{(userName.trim()[0] ?? 'S').toUpperCase()}</Display>
          </Chamfer>
        </View>
        <View style={{ flex: 1 }}>
          {editName ? (
            <TextInput
              value={userName}
              onChangeText={setUserName}
              onBlur={() => setEditName(false)}
              onSubmitEditing={() => setEditName(false)}
              autoFocus
              maxLength={16}
              accessibilityLabel="Name"
              style={{ color: colors.text, fontSize: 28, fontFamily: 'BigShoulders_900Black', textTransform: 'uppercase', padding: 0 }}
            />
          ) : (
            <Display size={36}>{userName || 'Spieler'}</Display>
          )}
          <Body size={13} weight="semi" color={colors.muted}>Tagesziel: {dailyGoalMin} Min</Body>
        </View>
        <IconButton icon="pencil" label="Name ändern" onPress={() => setEditName((v) => !v)} />
        <IconButton icon="target" label="Tagesziel ändern" onPress={() => setEditGoal((v) => !v)} color={editGoal ? colors.cyan : colors.text} />
      </View>

      {editGoal ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[...DAILY_GOALS.map((g) => g.min)].map((min) => {
            const on = min === dailyGoalMin;
            return (
              <Chamfer
                key={min}
                cut={8}
                borderWidth={0}
                fill={on ? ['#6BEBFF', '#22D8FF'] : colors.chip}
                vertical
                onPress={() => setDailyGoal(min)}
                accessibilityLabel={`${min} Minuten`}
                accessibilityState={{ selected: on }}
                style={{ flex: 1 }}
                contentStyle={{ height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <Body size={14} weight="bold" color={on ? colors.ink : colors.muted}>{min} Min</Body>
              </Chamfer>
            );
          })}
        </View>
      ) : null}

      <Chamfer cut={16} border={[colors.cyan, 'rgba(34,216,255,0.25)', colors.line]} fill={[colors.card, '#0A1226']} tint={colors.cyan} tintX={0.85}
        contentStyle={{ height: 104, paddingHorizontal: 18, justifyContent: 'center', gap: 2 }}>
        <Eyebrow>GESAMT-LERNZEIT</Eyebrow>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Display size={58} glow="rgba(34,216,255,0.5)" style={{ lineHeight: 60 }}>{h}</Display>
          <Display size={24} color={colors.cyan}>Std</Display>
          <Display size={58} style={{ lineHeight: 60, marginLeft: 8 }}>{m}</Display>
          <Display size={24} color={colors.cyan}>Min</Display>
        </View>
        <Body size={13} weight="semi" color={colors.text2}>
          {formatNumber(totalXp(sessions))} XP in {subjects.length} {subjects.length === 1 ? 'Fach' : 'Fächern'}
        </Body>
      </Chamfer>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chamfer cut={14} border={[colors.flame, 'rgba(255,138,31,0.2)', colors.line]} fill={[colors.card, '#0A1226']} tint={colors.flame} tintX={0.85} style={{ flex: 1 }}
          contentStyle={{ height: 112, padding: 12, paddingLeft: 14, justifyContent: 'space-between' }}>
          <Eyebrow>LÄNGSTER STREAK</Eyebrow>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Display size={50} style={{ lineHeight: 50 }}>{st.longest}</Display>
              <Display size={20} color={colors.flameSoft}>{st.longest === 1 ? 'Tag' : 'Tage'}</Display>
            </View>
            <Flame size={36} lit={st.longest > 0} />
          </View>
        </Chamfer>
        <Chamfer cut={14} border={[bestRank ? RANKS[bestRank.rank].main : colors.lineHi, 'rgba(94,162,255,0.2)', colors.line]} fill={[colors.card, '#0A1226']}
          tint={bestRank ? RANKS[bestRank.rank].main : undefined} tintX={0.85} style={{ flex: 1 }}
          contentStyle={{ height: 112, padding: 12, paddingLeft: 14, justifyContent: 'space-between' }}>
          <Eyebrow>STÄRKSTES FACH</Eyebrow>
          {best && bestRank ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
              <View style={{ flexShrink: 1 }}>
                <Display size={18} numberOfLines={1} style={{ lineHeight: 20 }}>{best.s.name}</Display>
                <Display size={16} color={RANKS[bestRank.rank].text}>{bestRank.label}</Display>
              </View>
              <View style={{ marginBottom: -4 }}><Emblem rank={bestRank.rank} size={46} /></View>
            </View>
          ) : (
            <Body size={13} color={colors.quiet}>Lerne eine Session, dann erscheint hier dein bestes Fach.</Body>
          )}
        </Chamfer>
      </View>

      <View style={{ gap: 10, marginTop: 4 }}>
        <Display size={18} color={colors.muted} tracking={0.1}>Lernzeit pro Fach</Display>
        {ranked.map(({ s, sec, xp }) => {
          const r = RANKS[rankFromXp(xp).rank];
          const t = formatDuration(sec);
          return (
            <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Body size={14} weight="semi" color={colors.text} numberOfLines={1} style={{ width: 86 }}>{s.name}</Body>
              <View style={{ flex: 1, height: 8, backgroundColor: colors.track }}>
                <View style={{ width: `${Math.max(sec > 0 ? 3 : 0, (sec / maxSec) * 100)}%`, height: '100%', backgroundColor: r.main }} />
              </View>
              <Body size={13} weight="bold" color={colors.text} style={{ width: 62, textAlign: 'right' }}>
                {t.h > 0 ? `${t.h} Std ${t.m}` : `${t.m} Min`}
              </Body>
            </View>
          );
        })}
      </View>

      <View style={{ gap: 8, marginTop: 4 }} onLayout={(e) => setHeatW(e.nativeEvent.layout.width)}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Display size={18} color={colors.muted} tracking={0.1}>Letzte 4 Wochen</Display>
          <Body size={12} weight="semi" color={colors.quiet}>weniger · mehr</Body>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {heat.map((lv, i) => (
            <View
              key={i}
              style={{
                width: cell, height: cell, backgroundColor: HEAT[lv],
                borderWidth: i === 27 ? 2 : 0, borderColor: '#FFFFFF',
                shadowColor: colors.cyan, shadowOpacity: lv === 3 ? 0.6 : 0, shadowRadius: 5, shadowOffset: { width: 0, height: 0 },
              }}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 10, gap: 8 }}>
        {confirmReset ? (
          <Chamfer cut={12} border={colors.stop} fill="#1A0B14" contentStyle={{ padding: 14, gap: 10 }}>
            <Body size={14} color={colors.text}>Alle Fächer, XP und Streaks löschen? Das kann nicht rückgängig gemacht werden.</Body>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chamfer cut={8} borderWidth={0} fill={colors.chip} onPress={() => setConfirmReset(false)} style={{ flex: 1 }} accessibilityLabel="Abbrechen"
                contentStyle={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Body size={14} weight="bold" color={colors.text}>Abbrechen</Body>
              </Chamfer>
              <Chamfer cut={8} borderWidth={0} fill={colors.stop} onPress={() => { setConfirmReset(false); resetAll().then(() => router.replace('/onboarding')); }} style={{ flex: 1 }} accessibilityLabel="Alles löschen"
                contentStyle={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Body size={14} weight="bold" color={colors.ink}>Alles löschen</Body>
              </Chamfer>
            </View>
          </Chamfer>
        ) : (
          <Pressable onPress={() => setConfirmReset(true)} accessibilityRole="button" style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <Icon name="trash" size={16} color={withAlpha(colors.stop, 0.9)} />
            <Body size={13} weight="semi" color={colors.stop}>Alle Daten zurücksetzen</Body>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
