import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Button, IconButton } from '../components/Button';
import { Chamfer } from '../components/Chamfer';
import { Icon } from '../components/Icon';
import { Screen } from '../components/Screen';
import { SubjectCard } from '../components/SubjectCard';
import { Body, Display, Eyebrow } from '../components/Typo';
import { subjectXp } from '../stats';
import { useStore } from '../store';
import { colors, ICON_LABELS, SUBJECT_COLORS, SUBJECT_ICONS, withAlpha } from '../theme';

export default function SubjectForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { subjects, sessions, addSubject, updateSubject, deleteSubject } = useStore();
  const existing = subjects.find((s) => s.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState<string>(existing?.icon ?? 'book');
  const [color, setColor] = useState<string>(existing?.color ?? SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length].hex);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [gridW, setGridW] = useState(354);
  const cell = (gridW - 5 * 8) / 6;

  const clean = name.trim();
  const duplicate = subjects.some((s) => s.id !== existing?.id && s.name.trim().toLowerCase() === clean.toLowerCase());
  const valid = clean.length > 0 && !duplicate;

  const save = () => {
    if (!valid) return;
    if (existing) updateSubject(existing.id, { name: clean, icon, color });
    else addSubject({ name: clean, icon, color });
    router.back();
  };

  return (
    <Screen
      scroll
      backdrop={{ top: color, topOpacity: 0.22 }}
      footer={<Button label={existing ? 'Speichern' : 'Fach erstellen'} icon={existing ? 'check' : 'plus'} variant={valid ? 'primary' : 'disabled'} onPress={save} />}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton icon="close" label="Schließen" onPress={() => router.back()} />
        <Display size={28} tracking={0.06}>{existing ? 'Fach bearbeiten' : 'Fach hinzufügen'}</Display>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ gap: 20, marginTop: 18 }}>
        <View style={{ gap: 8 }}>
          <Eyebrow>VORSCHAU</Eyebrow>
          <SubjectCard subject={{ name: clean || 'Neues Fach', icon, color }} xp={existing ? subjectXp(sessions, existing.id) : 0} />
        </View>

        <View style={{ gap: 8 }}>
          <Eyebrow>NAME</Eyebrow>
          <Chamfer cut={12} border={[colors.cyan, colors.blue]} borderWidth={1.5} fill="#0B1A38" glow={colors.cyan} glowRadius={8} contentStyle={{ height: 56, paddingHorizontal: 16, justifyContent: 'center' }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="z. B. Physik"
              placeholderTextColor="#6F84AA"
              maxLength={18}
              autoCapitalize="words"
              returnKeyType="done"
              accessibilityLabel="Name des Fachs"
              style={{ color: colors.text, fontSize: 20, fontFamily: 'Figtree_700Bold', padding: 0, outlineStyle: 'none' } as never}
            />
          </Chamfer>
          {duplicate ? <Body size={13} weight="semi" color={colors.stop}>Dieses Fach gibt es schon.</Body> : null}
        </View>

        <View style={{ gap: 8 }}>
          <Eyebrow>ICON</Eyebrow>
          <View onLayout={(e) => setGridW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SUBJECT_ICONS.map((ic) => {
              const on = ic === icon;
              return (
                <Chamfer
                  key={ic}
                  cut={9}
                  borderWidth={on ? 2 : 1.5}
                  border={on ? color : colors.line}
                  fill={on ? withAlpha(color, 0.16) : '#0C1530'}
                  glow={on ? color : undefined}
                  glowRadius={8}
                  onPress={() => setIcon(ic)}
                  accessibilityLabel={ICON_LABELS[ic]}
                  accessibilityState={{ selected: on }}
                  style={{ width: cell }}
                  contentStyle={{ height: 52, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name={ic} size={24} color={on ? color : colors.quiet} />
                </Chamfer>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Eyebrow>FARBE</Eyebrow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SUBJECT_COLORS.map((c) => {
              const on = c.hex === color;
              return (
                <Chamfer
                  key={c.key}
                  cut={9}
                  borderWidth={on ? 2 : 1.5}
                  border={on ? c.hex : colors.line}
                  fill={on ? withAlpha(c.hex, 0.16) : '#0C1530'}
                  glow={on ? c.hex : undefined}
                  glowRadius={8}
                  onPress={() => setColor(c.hex)}
                  accessibilityLabel={c.name}
                  accessibilityState={{ selected: on }}
                  style={{ width: (gridW - 7 * 8) / 8 > 38 ? (gridW - 7 * 8) / 8 : '23.6%' }}
                  contentStyle={{ height: 48, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.hex, alignItems: 'center', justifyContent: 'center' }}>
                    {on ? <Icon name="check" size={14} color="#150F33" sw={3.6} /> : null}
                  </View>
                </Chamfer>
              );
            })}
          </View>
          <Body size={13} weight="semi" color={colors.muted}>
            Gewählt: {SUBJECT_COLORS.find((c) => c.hex === color)?.name ?? 'Eigene Farbe'}
          </Body>
        </View>

        {existing ? (
          confirmDelete ? (
            <Chamfer cut={12} border={colors.stop} fill="#1A0B14" contentStyle={{ padding: 14, gap: 10 }}>
              <Body size={14} color={colors.text}>„{existing.name}“ samt aller XP und Sessions löschen?</Body>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chamfer cut={8} borderWidth={0} fill={colors.chip} onPress={() => setConfirmDelete(false)} style={{ flex: 1 }} accessibilityLabel="Abbrechen"
                  contentStyle={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
                  <Body size={14} weight="bold" color={colors.text}>Abbrechen</Body>
                </Chamfer>
                <Chamfer cut={8} borderWidth={0} fill={colors.stop} style={{ flex: 1 }} accessibilityLabel="Löschen"
                  onPress={() => { deleteSubject(existing.id); router.dismissAll(); }}
                  contentStyle={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
                  <Body size={14} weight="bold" color={colors.ink}>Löschen</Body>
                </Chamfer>
              </View>
            </Chamfer>
          ) : (
            <Pressable onPress={() => setConfirmDelete(true)} accessibilityRole="button" style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="trash" size={16} color={colors.stop} />
              <Body size={14} weight="semi" color={colors.stop}>Fach löschen</Body>
            </Pressable>
          )
        ) : null}
      </View>
    </Screen>
  );
}
