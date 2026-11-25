import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Backdrop } from '../components/Backdrop';
import { Button } from '../components/Button';
import { Chamfer } from '../components/Chamfer';
import { Emblem } from '../components/Emblem';
import { Flame } from '../components/Flame';
import { Float } from '../components/Float';
import { Icon } from '../components/Icon';
import { Rays } from '../components/Rays';
import { Body, Display, Eyebrow } from '../components/Typo';
import { useStore } from '../store';
import { colors, DAILY_GOALS, PRESET_SUBJECTS, SUBJECT_COLORS } from '../theme';
import { RANK_ORDER, RANKS, XP_PER_MINUTE } from '../ranks';

const DEFAULT_PICKS = ['Mathe', 'Deutsch', 'Englisch', 'Bio', 'Geschichte'];

interface Choice { name: string; icon: string; color: string }

function Progress({ step }: { step: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            flex: 1, height: 5, backgroundColor: i <= step ? colors.cyan : colors.track,
            shadowColor: colors.cyan, shadowOpacity: i === step ? 0.9 : 0, shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
          }}
        />
      ))}
    </View>
  );
}

function Title({ lines, accent }: { lines: string[]; accent?: number }) {
  return (
    <View style={{ gap: 0 }}>
      {lines.map((l, i) => (
        <Display key={i} size={54} skew={-6} color={i === accent ? colors.cyan : colors.text} style={{ lineHeight: 52, alignSelf: 'flex-start', paddingRight: 8 }}>
          {l}
        </Display>
      ))}
    </View>
  );
}

function StepHero() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 380, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
          <Rays size={560} color={colors.cyan} opacity={0.3} count={22} />
        </View>
        <View style={{ position: 'absolute', left: 4, bottom: 6 }}><Emblem rank="silber" size={104} /></View>
        <View style={{ position: 'absolute', right: 4, bottom: 6 }}><Emblem rank="diamant" size={104} /></View>
        <Float amount={8} duration={2500}><Emblem rank="gold" size={250} /></Float>
      </View>
      <View style={{ gap: 12, paddingTop: 8 }}>
        <Title lines={['Jedes Fach.', 'Ein eigener Rang.']} accent={1} />
        <Body size={16} color="#B4C4E2" style={{ maxWidth: 330 }}>
          Mathe, Deutsch, Englisch – jedes Fach steigt für sich auf. Von Bronze bis Champion.
        </Body>
      </View>
    </View>
  );
}

function StepXp() {
  return (
    <View style={{ flex: 1, gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Eyebrow color={colors.cyan}>SO FUNKTIONIERT'S</Eyebrow>
        <Title lines={['Fokus zahlt', 'sich aus.']} />
      </View>
      <Chamfer cut={18} border={[colors.cyan, 'rgba(34,216,255,0.25)', colors.line]} fill={[colors.card, '#0A1226']} tint={colors.cyan} tintX={0.8}
        contentStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Display size={84} style={{ lineHeight: 82 }}>1</Display>
            <Display size={28} color={colors.muted}>Min</Display>
          </View>
          <Display size={52} color={colors.cyan}>=</Display>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Display size={84} color={colors.cyan} glow="rgba(34,216,255,0.7)" style={{ lineHeight: 82 }}>{XP_PER_MINUTE}</Display>
            <Display size={28} color={colors.cyan}>XP</Display>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: colors.lineHi, opacity: 0.6 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="bolt" size={16} color={colors.cyan} />
          <Body size={14} weight="semi" color="#B4C4E2">25 Minuten am Stück sind 250 XP.</Body>
        </View>
      </Chamfer>

      {[
        { icon: 'play', t: 'Fokus starten', d: 'Timer an, Handy weg.' },
        { icon: 'bolt', t: 'XP sammeln', d: 'Jede Minute zählt für das Fach, das du lernst.' },
        { icon: 'trophy', t: 'Aufsteigen', d: 'Balken voll – nächste Stufe, nächster Rang.' },
      ].map((s) => (
        <View key={s.t} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Chamfer cut={9} border={colors.lineHi} borderWidth={1.5} fill="#0E1A3C" contentStyle={{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={s.icon} size={22} color={colors.cyan} />
          </Chamfer>
          <View style={{ flex: 1 }}>
            <Display size={22} style={{ lineHeight: 24 }}>{s.t}</Display>
            <Body size={14} color={colors.muted}>{s.d}</Body>
          </View>
        </View>
      ))}

      <View style={{ marginTop: 'auto', gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 66 }}>
          {RANK_ORDER.map((r, i) => (
            <View key={r} style={{ marginBottom: i * 3.5 }}><Emblem rank={r} size={46} /></View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', height: 3 }}>
          {RANK_ORDER.map((r) => <View key={r} style={{ flex: 1, backgroundColor: RANKS[r].main }} />)}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Body size={12} weight="bold" color={colors.quiet} tracking={1.4}>BRONZE</Body>
          <Body size={12} weight="bold" color={colors.quiet} tracking={1.4}>CHAMPION</Body>
        </View>
      </View>
    </View>
  );
}

function StepSubjects({ picks, setPicks }: { picks: Choice[]; setPicks: (p: Choice[]) => void }) {
  const [custom, setCustom] = useState(false);
  const [text, setText] = useState('');
  const all: Choice[] = [
    ...PRESET_SUBJECTS.map((p) => ({ name: p.name, icon: p.icon, color: p.color })),
    ...picks.filter((p) => !PRESET_SUBJECTS.some((x) => x.name === p.name)),
  ];
  const isOn = (n: string) => picks.some((p) => p.name === n);
  const toggle = (c: Choice) => setPicks(isOn(c.name) ? picks.filter((p) => p.name !== c.name) : [...picks, c]);
  const addCustom = () => {
    const name = text.trim();
    if (!name || picks.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    setPicks([...picks, { name, icon: 'book', color: SUBJECT_COLORS[picks.length % SUBJECT_COLORS.length].hex }]);
    setText('');
    setCustom(false);
  };

  return (
    <View style={{ gap: 14 }}>
      <Title lines={['Wähle deine', 'Fächer.']} accent={1} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Body size={15} color="#B4C4E2" style={{ flex: 1 }}>Jedes startet bei Bronze I. Ändern geht jederzeit.</Body>
        <Chamfer cut={7} border="rgba(34,216,255,0.5)" borderWidth={1} fill="rgba(34,216,255,0.14)" contentStyle={{ height: 28, paddingHorizontal: 12, justifyContent: 'center' }}>
          <Body size={13} weight="bold" color={colors.cyan}>{picks.length} gewählt</Body>
        </Chamfer>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {all.map((c) => {
          const on = isOn(c.name);
          return (
            <Chamfer
              key={c.name}
              cut={10}
              border={on ? [colors.cyan, colors.blue] : colors.line}
              borderWidth={1.5}
              fill={on ? ['#0F2748', '#0B1A38'] : '#0C1530'}
              onPress={() => toggle(c)}
              accessibilityLabel={c.name}
              accessibilityState={{ selected: on }}
              style={{ width: '48.6%' }}
              contentStyle={{ height: 53, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 12, paddingRight: 10 }}
            >
              <Icon name={c.icon} size={22} color={on ? colors.cyan : colors.quiet} />
              <Body size={15} weight={on ? 'bold' : 'semi'} color={on ? colors.text : '#B4C4E2'} style={{ flex: 1 }} numberOfLines={1}>{c.name}</Body>
              {on ? (
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={13} color={colors.ink} sw={3.4} />
                </View>
              ) : null}
            </Chamfer>
          );
        })}
        {custom ? (
          <Chamfer cut={10} border={[colors.cyan, colors.blue]} borderWidth={1.5} fill="#0B1A38" style={{ width: '100%' }}
            contentStyle={{ height: 53, flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 6, gap: 8 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={addCustom}
              placeholder="Name des Fachs"
              placeholderTextColor="#6F84AA"
              autoFocus
              maxLength={18}
              returnKeyType="done"
              accessibilityLabel="Name des neuen Fachs"
              style={{ flex: 1, color: colors.text, fontSize: 17, fontFamily: 'Figtree_700Bold', padding: 0 }}
            />
            <Pressable onPress={addCustom} accessibilityLabel="Fach hinzufügen" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={22} color={colors.cyan} sw={2.6} />
            </Pressable>
          </Chamfer>
        ) : (
          <Chamfer cut={10} border="#2A4380" borderWidth={1.5} fill="#080F22" onPress={() => setCustom(true)} accessibilityLabel="Eigenes Fach" style={{ width: '48.6%' }}
            contentStyle={{ height: 53, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 12 }}>
            <Icon name="plus" size={22} color={colors.cyan} sw={2.2} />
            <Body size={16} weight="bold" color={colors.cyan}>Eigenes Fach</Body>
          </Chamfer>
        )}
      </View>
    </View>
  );
}

function StepGoal({ goal, setGoal }: { goal: number; setGoal: (g: number) => void }) {
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 10 }}>
        <Title lines={['Dein', 'Tagesziel.']} accent={1} />
        <Body size={15} color="#B4C4E2" style={{ maxWidth: 320 }}>Erreichst du es, bleibt deine Flamme an. Dein Streak wächst.</Body>
      </View>
      <Chamfer cut={16} border={[colors.flame, 'rgba(34,216,255,0.4)', colors.line]} fill={[colors.card, '#0A1226']} tint={colors.flame} tintX={0.12}
        contentStyle={{ height: 98, flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 16, paddingRight: 20 }}>
        <Flame size={54} />
        <Display size={84} glow="rgba(255,138,31,0.55)" style={{ lineHeight: 82 }}>{goal}</Display>
        <View style={{ flex: 1 }}>
          <Display size={24} style={{ lineHeight: 26 }}>Min pro Tag</Display>
          <Body size={14} weight="bold" color={colors.cyan}>= {goal * XP_PER_MINUTE} XP</Body>
        </View>
      </Chamfer>
      <View style={{ gap: 8 }}>
        {DAILY_GOALS.map((g) => {
          const on = g.min === goal;
          return (
            <Chamfer
              key={g.min}
              cut={12}
              border={on ? [colors.cyan, colors.blue] : colors.line}
              borderWidth={1.5}
              fill={on ? ['#0F2748', '#0B1A38'] : '#0C1530'}
              onPress={() => setGoal(g.min)}
              accessibilityLabel={`${g.min} Minuten, ${g.label}`}
              accessibilityState={{ selected: on }}
              contentStyle={{ height: 60, flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 14, paddingRight: 16 }}
            >
              <Display size={38} color={on ? colors.cyan : '#B4C4E2'} glow={on ? 'rgba(34,216,255,0.6)' : undefined} style={{ width: 52 }}>{g.min}</Display>
              <Body size={16} weight="bold" color={on ? colors.text : '#B4C4E2'} style={{ flex: 1 }}>{g.label}</Body>
              <Body size={13} weight={on ? 'bold' : 'semi'} color={on ? colors.cyan : colors.quiet}>{g.min * XP_PER_MINUTE} XP</Body>
              {on ? (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={14} color={colors.ink} sw={3.4} />
                </View>
              ) : (
                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.lineHi }} />
              )}
            </Chamfer>
          );
        })}
      </View>
      <Body size={13} color={colors.quiet}>Du kannst das Ziel jederzeit im Profil ändern.</Body>
    </View>
  );
}

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Choice[]>(
    DEFAULT_PICKS.map((n) => PRESET_SUBJECTS.find((p) => p.name === n)!).map((p) => ({ name: p.name, icon: p.icon, color: p.color })),
  );
  const [goal, setGoal] = useState(45);

  const last = step === 3;
  const canNext = step !== 2 || picks.length > 0;
  const next = () => {
    if (!last) return setStep(step + 1);
    completeOnboarding(picks, goal);
    router.replace('/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.screen, overflow: 'hidden' }}>
      <Backdrop />
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Progress step={step} />
        <View style={{ width: 92, alignItems: 'flex-end' }}>
          {step < 2 ? (
            <Pressable onPress={() => setStep(2)} accessibilityRole="button" style={{ height: 44, justifyContent: 'center', paddingHorizontal: 4 }}>
              <Body size={14} weight="semi" color={colors.muted}>Überspringen</Body>
            </Pressable>
          ) : step > 0 ? (
            <Pressable onPress={() => setStep(step - 1)} accessibilityRole="button" accessibilityLabel="Zurück" style={{ height: 44, justifyContent: 'center', paddingHorizontal: 4 }}>
              <Body size={14} weight="semi" color={colors.muted}>Zurück</Body>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {step === 0 ? <StepHero /> : step === 1 ? <StepXp /> : step === 2 ? <StepSubjects picks={picks} setPicks={setPicks} /> : <StepGoal goal={goal} setGoal={setGoal} />}
      </ScrollView>

      <View style={{ paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 14) + 20 }}>
        <Button label={last ? "Los geht's" : 'Weiter'} icon={last ? 'bolt' : 'chevron-right'} iconRight variant={canNext ? 'primary' : 'disabled'} onPress={next} />
      </View>
    </View>
  );
}
