import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Chamfer } from '../components/Chamfer';
import { Flame } from '../components/Flame';
import { Icon } from '../components/Icon';
import { Ring } from '../components/Ring';
import { SubjectCard } from '../components/SubjectCard';
import { Body, Display } from '../components/Typo';
import { formatNumber } from '../ranks';
import { secondsByDay, streaks, subjectXp, todayIndex, todaySeconds, totalXp, weekKeys, WEEKDAYS } from '../stats';
import { useStore } from '../store';
import { colors } from '../theme';

function WeekDots({ goalMin, sessions }: { goalMin: number; sessions: ReturnType<typeof useStore>['sessions'] }) {
  const days = secondsByDay(sessions);
  const keys = weekKeys();
  const today = todayIndex();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {keys.map((k, i) => {
        const done = (days[k] ?? 0) >= goalMin * 60;
        const isToday = i === today;
        return (
          <View key={k} style={{ alignItems: 'center', gap: 4, flex: 1 }}>
            <Body size={12} weight={isToday ? 'bold' : 'semi'} color={isToday ? colors.flameSoft : colors.quiet}>
              {WEEKDAYS[i]}
            </Body>
            {done ? (
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={14} color="#04243A" sw={3.2} />
              </View>
            ) : isToday ? (
              <View
                style={{
                  width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.flame,
                  backgroundColor: 'rgba(255,138,31,0.2)', shadowColor: colors.flame, shadowOpacity: 0.7, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
                }}
              />
            ) : (
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#14204A' }} />
            )}
          </View>
        );
      })}
    </View>
  );
}

export function HomeTab() {
  const { subjects, sessions, dailyGoalMin } = useStore();
  const insets = useSafeAreaInsets();
  const st = useMemo(() => streaks(sessions, dailyGoalMin), [sessions, dailyGoalMin]);
  const todaySec = todaySeconds(sessions);
  const todayMin = Math.floor(todaySec / 60);
  const progress = todaySec / (dailyGoalMin * 60);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingHorizontal: 18, paddingBottom: 20, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Display size={40} skew={-8} glow="rgba(34,216,255,0.6)" style={{ paddingRight: 6 }}>
          Grind<Display size={40} color={colors.cyan} skew={0}>.</Display>
        </Display>
        <Chamfer cut={8} border={colors.line} borderWidth={1} fill={colors.chip}
          contentStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, paddingLeft: 10, paddingRight: 14 }}>
          <Icon name="bolt" size={18} color={colors.cyan} />
          <Body size={14} weight="bold" color={colors.text}>{formatNumber(totalXp(sessions))} XP</Body>
        </Chamfer>
      </View>

      <Chamfer
        cut={16}
        border={[colors.flame, 'rgba(34,216,255,0.45)', colors.line]}
        fill={[colors.card, '#0A1226']}
        tint={colors.flame}
        tintX={0.12}
        contentStyle={{ paddingVertical: 12, paddingLeft: 14, paddingRight: 16, gap: 10 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Flame size={46} lit={st.current > 0} />
          <View style={{ flex: 1 }}>
            <Display size={58} glow="rgba(255,138,31,0.7)" style={{ lineHeight: 56 }}>{st.current}</Display>
            <Body size={12} weight="bold" color={colors.flameSoft} tracking={1.7}>
              {st.current === 1 ? 'TAG STREAK' : 'TAGE STREAK'}
            </Body>
          </View>
          <Ring size={78} progress={progress}>
            <Display size={26} style={{ lineHeight: 26 }}>{todayMin}</Display>
            <Body size={10} weight="bold" color={colors.muted} tracking={0.8} style={{ lineHeight: 12 }}>/ {dailyGoalMin} MIN</Body>
          </Ring>
        </View>
        <WeekDots goalMin={dailyGoalMin} sessions={sessions} />
      </Chamfer>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Display size={20} color={colors.muted} tracking={0.1}>Deine Fächer</Display>
        <Pressable
          onPress={() => router.push('/subject-form')}
          accessibilityRole="button"
          accessibilityLabel="Fach hinzufügen"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 4 }}
        >
          <Icon name="plus" size={16} color={colors.cyan} sw={2.4} />
          <Body size={14} weight="bold" color={colors.cyan}>Fach</Body>
        </Pressable>
      </View>

      <View style={{ gap: 8, marginTop: -8 }}>
        {subjects.length === 0 ? (
          <Chamfer cut={14} border={colors.line} fill={colors.card} contentStyle={{ padding: 20, gap: 14, alignItems: 'center' }}>
            <Body size={15} align="center" color={colors.text2}>Noch kein Fach. Lege dein erstes an und starte deinen Aufstieg bei Bronze I.</Body>
            <Button label="Fach hinzufügen" icon="plus" onPress={() => router.push('/subject-form')} height={52} size={22} />
          </Chamfer>
        ) : (
          subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} xp={subjectXp(sessions, s.id)} onPress={() => router.push(`/subject/${s.id}`)} />
          ))
        )}
      </View>
    </ScrollView>
  );
}
