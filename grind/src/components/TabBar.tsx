import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { Icon } from './Icon';
import { Display } from './Typo';

export type TabKey = 'home' | 'ranks' | 'profile';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Fächer', icon: 'home' },
  { key: 'ranks', label: 'Ränge', icon: 'trophy' },
  { key: 'profile', label: 'Profil', icon: 'user' },
];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row', paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 10) + 6,
        backgroundColor: 'rgba(6,10,22,0.94)', borderTopWidth: 1, borderTopColor: colors.line, gap: 8,
      }}
    >
      {TABS.map((t) => {
        const on = t.key === active;
        const c = on ? colors.cyan : colors.quiet;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
            style={{ flex: 1, alignItems: 'center', gap: 4, paddingBottom: 2 }}
          >
            <View
              style={{
                width: 34, height: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
                backgroundColor: on ? colors.cyan : 'transparent',
                shadowColor: colors.cyan, shadowOpacity: on ? 0.9 : 0, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
              }}
            />
            <Icon name={t.icon} size={26} color={c} sw={1.9} />
            <Display size={14} color={c} tracking={0.08} style={{ lineHeight: 16 }}>{t.label}</Display>
          </Pressable>
        );
      })}
    </View>
  );
}
