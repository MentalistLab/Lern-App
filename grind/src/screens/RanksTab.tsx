import React, { useState } from 'react';
import { Pressable, ScrollView, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chamfer } from '../components/Chamfer';
import { Emblem } from '../components/Emblem';
import { Icon } from '../components/Icon';
import { Body, Display } from '../components/Typo';
import { formatNumber, RANK_ORDER, RANKS, rankFromXp, type RankKey } from '../ranks';
import { subjectXp } from '../stats';
import { useStore } from '../store';
import { colors, withAlpha } from '../theme';

type Status = 'done' | 'current' | 'locked';

function Pips({ filled, color, glow }: { filled: number; color: string; glow?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 14, height: 4, backgroundColor: i < filled ? color : colors.line,
            shadowColor: color, shadowOpacity: glow && i < filled ? 0.9 : 0, shadowRadius: 5, shadowOffset: { width: 0, height: 0 },
          }}
        />
      ))}
    </View>
  );
}

function RankCard({ rank, status, tier, width, wide }: { rank: RankKey; status: Status; tier: number; width?: number; wide?: boolean }) {
  const m = RANKS[rank];
  const locked = status === 'locked';
  const current = status === 'current';
  const nameColor = locked ? '#7F90B4' : m.text;
  const label = locked ? `ab ${formatNumber(m.startXp)} XP` : current ? 'DU BIST HIER' : 'Erreicht';
  const labelColor = locked ? '#7F90B4' : current ? colors.cyan : colors.muted;
  const a11y = `${m.name}, ${locked ? 'gesperrt' : current ? 'aktueller Rang' : 'erreicht'}`;

  if (wide) {
    return (
      <Chamfer
        cut={14}
        border={locked ? '#1B2750' : [m.main, withAlpha(m.main, 0.3), colors.line]}
        fill={locked ? '#0A1124' : [colors.card, colors.cardDeep]}
        tint={locked ? undefined : m.main}
        glow={current ? colors.cyan : undefined}
        accessibilityLabel={a11y}
        contentStyle={{ height: 133, flexDirection: 'row', alignItems: 'center', gap: 16, paddingLeft: 14, paddingRight: 20 }}
      >
        <Emblem rank={rank} size={104} locked={locked} />
        <View style={{ flex: 1, gap: 4 }}>
          <Display size={36} color={nameColor}>{m.name}</Display>
          <Body size={13} color={locked ? '#7F90B4' : colors.text2}>Die Spitze. Keine Stufen – nur der Titel.</Body>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {locked ? <Icon name="lock" size={14} color="#7F90B4" /> : null}
            <Body size={12} weight="bold" color={labelColor}>{label}</Body>
          </View>
        </View>
      </Chamfer>
    );
  }

  return (
    <Chamfer
      cut={12}
      border={locked ? '#1B2750' : current ? [colors.cyan, '#5EA2FF', colors.blue] : [m.main, withAlpha(m.main, 0.2), colors.line]}
      borderWidth={current ? 2 : 1.5}
      fill={locked ? '#0A1124' : current ? ['#112250', '#0A1633'] : [colors.card, colors.cardDeep]}
      tint={locked ? undefined : m.main}
      tintX={0.5}
      glow={current ? colors.cyan : undefined}
      accessibilityLabel={a11y}
      style={{ width }}
      contentStyle={{ height: 133, alignItems: 'center', justifyContent: 'center', gap: 3 }}
    >
      <Emblem rank={rank} size={66} locked={locked} />
      <Display size={22} color={nameColor}>{m.name}</Display>
      <Pips filled={locked ? 0 : status === 'done' ? 3 : tier} color={current ? colors.cyan : nameColor} glow={current} />
      <Body size={11} weight={current ? 'bold' : 'semi'} color={labelColor} tracking={current ? 0.6 : 0}>{label}</Body>
    </Chamfer>
  );
}

export function RanksTab() {
  const { subjects, sessions } = useStore();
  const insets = useSafeAreaInsets();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [gridW, setGridW] = useState(354);
  const current = subjects.find((s) => s.id === pickedId) ?? subjects[0];
  const state = rankFromXp(current ? subjectXp(sessions, current.id) : 0);
  const curIdx = RANK_ORDER.indexOf(state.rank);
  const cell = (gridW - 16) / 3;

  const status = (i: number): Status => (i < curIdx ? 'done' : i === curIdx ? 'current' : 'locked');

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingHorizontal: 18, paddingBottom: 20, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Display size={42} skew={-8} glow="rgba(34,216,255,0.5)" style={{ paddingRight: 6 }}>Alle Ränge</Display>
        <Body size={12} weight="bold" color={colors.quiet} tracking={1.4}>7 RÄNGE · 3 STUFEN</Body>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0 }}>
        {subjects.map((s) => {
          const on = s.id === current?.id;
          return (
            <Chamfer
              key={s.id}
              cut={8}
              borderWidth={0}
              fill={on ? ['#6BEBFF', '#22D8FF'] : colors.chip}
              vertical
              onPress={() => setPickedId(s.id)}
              accessibilityLabel={s.name}
              accessibilityState={{ selected: on }}
              contentStyle={{ height: 44, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              {on ? <Icon name={s.icon} size={16} color={colors.ink} sw={2.2} /> : null}
              <Body size={14} weight={on ? 'bold' : 'semi'} color={on ? colors.ink : colors.muted}>{s.name}</Body>
            </Chamfer>
          );
        })}
      </ScrollView>

      {!current ? (
        <Body size={15} color={colors.text2}>Lege zuerst ein Fach an, dann siehst du hier deinen Weg von Bronze bis Champion.</Body>
      ) : (
        <View onLayout={(e: LayoutChangeEvent) => setGridW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {RANK_ORDER.slice(0, 6).map((r, i) => (
            <RankCard key={r} rank={r} status={status(i)} tier={status(i) === 'current' ? state.tier : 3} width={cell} />
          ))}
          <View style={{ width: '100%' }}>
            <RankCard rank="champion" status={status(6)} tier={0} wide />
          </View>
        </View>
      )}

      <Body size={13} color={colors.quiet}>Jeder Rang hat drei Stufen (I–III). Dunkle Ränge sind noch gesperrt.</Body>
    </ScrollView>
  );
}
