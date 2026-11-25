import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Backdrop } from '../../components/Backdrop';
import { Button } from '../../components/Button';
import { Chamfer } from '../../components/Chamfer';
import { Emblem } from '../../components/Emblem';
import { Icon } from '../../components/Icon';
import { Body, Display, Eyebrow } from '../../components/Typo';
import { RANKS, rankFromXp, xpForSeconds, XP_PER_MINUTE } from '../../ranks';
import { clock, subjectXp } from '../../stats';
import { useStore } from '../../store';
import { colors, TIMER_PRESETS } from '../../theme';

const RING = 320;
const R = 132;
const C = 2 * Math.PI * R;

type Phase = 'setup' | 'running' | 'paused';

export default function Timer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subjects, sessions, recordSession } = useStore();
  const insets = useSafeAreaInsets();
  const subject = subjects.find((s) => s.id === id);

  const [minutes, setMinutes] = useState<number>(25);
  const [phase, setPhase] = useState<Phase>('setup');
  const [elapsed, setElapsed] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const acc = useRef(0);
  const since = useRef<number | null>(null);
  const startedAt = useRef(0);
  const finished = useRef(false);

  const total = minutes * 60;
  const elapsedNow = () => (acc.current + (since.current ? Date.now() - since.current : 0)) / 1000;

  const finish = useCallback(
    (seconds: number) => {
      if (finished.current || !subject) return;
      finished.current = true;
      const sec = Math.min(seconds, total);
      if (xpForSeconds(sec) < 1) {
        router.back();
        return;
      }
      const res = recordSession(subject.id, sec, startedAt.current);
      if (!res) {
        router.back();
        return;
      }
      router.replace({
        pathname: '/done',
        params: { subjectId: subject.id, seconds: String(Math.round(sec)), xpBefore: String(res.before.xp), xpGained: String(res.session.xp) },
      });
    },
    [subject, recordSession, total],
  );

  const pause = useCallback(() => {
    if (since.current) {
      acc.current += Date.now() - since.current;
      since.current = null;
    }
    setElapsed(acc.current / 1000);
    setPhase((p) => (p === 'running' ? 'paused' : p));
  }, []);

  const resume = () => {
    since.current = Date.now();
    setPhase('running');
  };

  const start = () => {
    startedAt.current = Date.now();
    acc.current = 0;
    since.current = Date.now();
    setElapsed(0);
    setPhase('running');
  };

  useEffect(() => {
    if (phase !== 'running') return;
    const t = setInterval(() => {
      const e = elapsedNow();
      setElapsed(e);
      if (e >= total) finish(total);
    }, 200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, total, finish]);

  useEffect(() => {
    if (phase === 'running') activateKeepAwakeAsync('grind-timer').catch(() => {});
    else deactivateKeepAwake('grind-timer').catch(() => {});
    return () => {
      deactivateKeepAwake('grind-timer').catch(() => {});
    };
  }, [phase]);

  // Ablenkungsfrei: App verlassen pausiert den Timer.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active' && since.current) pause();
    });
    return () => sub.remove();
  }, [pause]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'setup') return false;
      openConfirm();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const openConfirm = () => {
    if (phase === 'running') pause();
    setConfirm(true);
  };

  if (!subject) return <Redirect href="/home" />;

  const r = rankFromXp(subjectXp(sessions, subject.id));
  const m = RANKS[r.rank];
  const progress = Math.min(1, elapsed / total);
  const remaining = total - elapsed;
  const xpNow = xpForSeconds(elapsed);
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  const kx = RING / 2 + R * Math.cos(angle);
  const ky = RING / 2 + R * Math.sin(angle);
  const setup = phase === 'setup';

  return (
    <View style={{ flex: 1, backgroundColor: '#03050B', overflow: 'hidden' }}>
      <Backdrop base="#03050B" top={colors.cyan} topOpacity={0.1} center={colors.cyan} centerY="40%" centerOpacity={0.2} />

      <View style={{ paddingTop: insets.top + 12, alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: phase === 'paused' ? colors.flame : colors.cyan, shadowColor: colors.cyan, shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }} />
          <Body size={12} weight="bold" color={phase === 'paused' ? colors.flame : colors.cyan} tracking={2.4}>
            {setup ? 'BEREIT' : phase === 'paused' ? 'PAUSIERT' : 'FOKUS-SESSION'}
          </Body>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Emblem rank={r.rank} size={48} />
          <View>
            <Display size={38} numberOfLines={1} style={{ lineHeight: 38, maxWidth: 240 }}>{subject.name}</Display>
            <Display size={16} color={m.text} style={{ lineHeight: 18 }}>{r.label}</Display>
          </View>
        </View>
      </View>

      <View style={{ alignItems: 'center', marginTop: 22 }}>
        <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={RING} height={RING} style={{ position: 'absolute' }}>
            <Defs>
              <LinearGradient id="tmArc" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#7DF0FF" />
                <Stop offset="0.55" stopColor={colors.cyan} />
                <Stop offset="1" stopColor={colors.blue} />
              </LinearGradient>
            </Defs>
            <Circle cx={RING / 2} cy={RING / 2} r={150} fill="none" stroke="#1B2750" strokeWidth={6} strokeDasharray="2 11.09" />
            <Circle cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke="#0E1A3C" strokeWidth={16} />
            {progress > 0 ? (
              <Circle
                cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke={colors.cyan} strokeOpacity={0.16} strokeWidth={34} strokeLinecap="round"
                strokeDasharray={`${C * progress} ${C}`} transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
              />
            ) : null}
            {progress > 0 ? (
              <Circle
                cx={RING / 2} cy={RING / 2} r={R} fill="none" stroke="url(#tmArc)" strokeWidth={16} strokeLinecap="round"
                strokeDasharray={`${C * progress} ${C}`} transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
              />
            ) : null}
            <Circle cx={RING / 2} cy={RING / 2} r={110} fill="none" stroke={colors.line} strokeWidth={1.5} />
            {progress > 0 ? (
              <>
                <Circle cx={kx} cy={ky} r={10} fill="#FFFFFF" />
                <Circle cx={kx} cy={ky} r={16} fill="none" stroke={colors.cyan} strokeOpacity={0.6} strokeWidth={2} />
              </>
            ) : null}
          </Svg>
          <Eyebrow>{setup ? 'DAUER' : 'NOCH'}</Eyebrow>
          <Display size={108} glow="rgba(34,216,255,0.5)" style={{ lineHeight: 100 }}>{setup ? `${minutes}:00` : clock(remaining)}</Display>
          <Body size={14} weight="semi" color={colors.muted}>{setup ? 'Minuten' : `von ${minutes}:00 Min`}</Body>
        </View>
      </View>

      {setup ? (
        <View style={{ paddingHorizontal: 18, marginTop: 26, gap: 18 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {TIMER_PRESETS.map((p) => {
              const on = p === minutes;
              return (
                <Chamfer key={p} cut={8} borderWidth={0} fill={on ? ['#6BEBFF', '#22D8FF'] : colors.chip} vertical onPress={() => setMinutes(p)}
                  accessibilityLabel={`${p} Minuten`} accessibilityState={{ selected: on }} style={{ flex: 1 }}
                  contentStyle={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
                  <Body size={15} weight="bold" color={on ? colors.ink : colors.muted}>{p} Min</Body>
                </Chamfer>
              );
            })}
          </View>
          <Body size={13} color={colors.quiet} align="center">
            {minutes} Min Fokus = {minutes * XP_PER_MINUTE} XP für {subject.name}
          </Body>
        </View>
      ) : (
        <View style={{ alignItems: 'center', marginTop: 20, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="bolt" size={34} color={colors.cyan} sw={2.2} />
            <Display size={72} color={colors.cyan} glow="rgba(34,216,255,0.7)" style={{ lineHeight: 72 }}>+{xpNow} XP</Display>
          </View>
          <Body size={13} weight="semi" color={colors.muted}>{XP_PER_MINUTE} XP pro Minute</Body>
        </View>
      )}

      <View style={{ flex: 1 }} />

      {setup ? (
        <View style={{ paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 14) + 20, gap: 8 }}>
          <Button label="Start" icon="play" onPress={start} height={60} size={28} />
          <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Body size={14} weight="semi" color={colors.muted}>Abbrechen</Body>
          </Pressable>
        </View>
      ) : (
        <View style={{ paddingBottom: Math.max(insets.bottom, 14) + 16, alignItems: 'center', gap: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
            <Pressable
              onPress={openConfirm}
              accessibilityRole="button"
              accessibilityLabel="Session beenden"
              style={({ pressed }) => ({
                width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: colors.stop, backgroundColor: 'rgba(255,93,115,0.1)',
                alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
                shadowColor: colors.stop, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
              })}
            >
              <Icon name="stop" size={26} color={colors.stop} sw={2.4} />
            </Pressable>
            <Pressable
              onPress={phase === 'running' ? pause : resume}
              accessibilityRole="button"
              accessibilityLabel={phase === 'running' ? 'Pausieren' : 'Fortsetzen'}
              style={({ pressed }) => ({
                width: 92, height: 92, borderRadius: 46, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center',
                transform: [{ scale: pressed ? 0.96 : 1 }],
                shadowColor: colors.cyan, shadowOpacity: 0.7, shadowRadius: 18, shadowOffset: { width: 0, height: 0 },
              })}
            >
              <Icon name={phase === 'running' ? 'pause' : 'play'} size={38} color={colors.ink} sw={3} />
            </Pressable>
          </View>
          <Body size={13} color={colors.quiet} align="center" style={{ paddingHorizontal: 24 }}>
            Bleib dran – wenn du die App verlässt, pausiert der Timer.
          </Body>
        </View>
      )}

      {confirm ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3,5,11,0.86)', justifyContent: 'center', padding: 24 }}>
          <Chamfer cut={16} border={[colors.cyan, colors.line]} fill={[colors.card, '#0A1226']} contentStyle={{ padding: 20, gap: 14 }}>
            <Display size={32}>Session beenden?</Display>
            <Body size={15} color={colors.text2}>
              {xpForSeconds(elapsed) >= 1
                ? `Du bekommst ${xpNow} XP für ${Math.max(1, Math.round(elapsed / 60))} Min Fokus in ${subject.name}.`
                : 'Bisher keine XP, denn die Session ist kürzer als 6 Sekunden.'}
            </Body>
            <Button label="Weiter fokussieren" icon="play" height={52} size={22} onPress={() => { setConfirm(false); resume(); }} />
            <Button label="Beenden" variant="outline" height={52} size={22} onPress={() => finish(elapsedNow())} />
          </Chamfer>
        </View>
      ) : null}
    </View>
  );
}
