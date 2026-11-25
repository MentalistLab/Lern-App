import React from 'react';
import { View } from 'react-native';
import { formatNumber, RANKS, rankFromXp } from '../ranks';
import type { Subject } from '../store';
import { colors, withAlpha } from '../theme';
import { Chamfer } from './Chamfer';
import { Emblem } from './Emblem';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';
import { Body, Display } from './Typo';

interface Props {
  subject: Pick<Subject, 'name' | 'icon' | 'color'>;
  xp: number;
  onPress?: () => void;
}

/** Fach-Karte mit Emblem, Rang und Fortschritt zum nächsten Rang. */
export function SubjectCard({ subject, xp, onPress }: Props) {
  const r = rankFromXp(xp);
  const m = RANKS[r.rank];
  const nearly = r.rank !== 'champion' && r.pct >= 0.85;
  return (
    <Chamfer
      cut={14}
      border={[m.main, withAlpha(m.main, 0.25), colors.line]}
      fill={[colors.card, colors.cardDeep]}
      tint={m.main}
      tintX={0.14}
      onPress={onPress}
      accessibilityLabel={`${subject.name}, ${r.label}`}
      contentStyle={{ height: 84, flexDirection: 'row', alignItems: 'center', paddingLeft: 6, paddingRight: 14, gap: 10 }}
    >
      <Emblem rank={r.rank} size={70} />
      <View style={{ flex: 1, gap: 7 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 }}>
            <Icon name={subject.icon} size={18} color={subject.color} />
            <Display size={25} color={colors.text} numberOfLines={1} style={{ flexShrink: 1 }}>
              {subject.name || 'Fach'}
            </Display>
          </View>
          <Display size={20} color={m.text}>{r.label}</Display>
        </View>
        <ProgressBar value={r.pct} colors={[m.barFrom, m.barTo]} glow={m.main} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Body size={12} weight="semi" color={colors.muted}>
            {r.rank === 'champion' ? `${formatNumber(xp)} XP` : `${formatNumber(r.xpIntoTier)} / ${formatNumber(r.tierXp)} XP`}
          </Body>
          {r.rank === 'champion' ? null : nearly ? (
            <Body size={12} weight="bold" color={colors.cyan}>
              Noch {formatNumber(r.xpToNext)} XP bis {r.nextIsNewRank ? RANKS[r.nextRank!].name : r.nextLabel}
            </Body>
          ) : (
            <Body size={12} weight="semi" color={colors.muted}>{Math.floor(r.pct * 100)} %</Body>
          )}
        </View>
      </View>
    </Chamfer>
  );
}
