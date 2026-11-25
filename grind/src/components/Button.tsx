import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme';
import { Chamfer } from './Chamfer';
import { Icon } from './Icon';
import { Display } from './Typo';

type Variant = 'primary' | 'gold' | 'outline' | 'disabled';

const STYLE: Record<Variant, { fill: string | string[]; border?: string | string[]; text: string; glow?: string }> = {
  primary: { fill: ['#6BEBFF', '#22D8FF', '#0EA5E9'], text: colors.ink, glow: colors.cyan },
  gold: { fill: ['#FFF0A8', '#FFC233', '#E39A0A'], text: '#2A1700', glow: '#FFC233' },
  outline: { fill: '#0A1226', border: [colors.cyan, colors.blue], text: colors.cyan },
  disabled: { fill: colors.track, text: '#7F90B4' },
};

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: string;
  /** Icon hinter dem Text statt davor (z. B. Pfeil bei "Weiter"). */
  iconRight?: boolean;
  height?: number;
  size?: number;
  style?: React.ComponentProps<typeof Chamfer>['style'];
}

/** Hauptbutton im Spiel-Look: eckig geschnitten, Versalien, Glow. */
export function Button({ label, onPress, variant = 'primary', icon, iconRight = false, height = 58, size = 26, style }: Props) {
  const s = STYLE[variant];
  const outline = variant === 'outline';
  return (
    <Chamfer
      cut={14}
      borderWidth={outline ? 2 : 0}
      border={s.border}
      fill={s.fill}
      vertical
      glow={s.glow}
      onPress={variant === 'disabled' ? undefined : onPress}
      accessibilityLabel={label}
      style={style}
      contentStyle={{ height, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16 }}
    >
      {icon && !iconRight ? <Icon name={icon} size={size - 4} color={s.text} sw={2.8} /> : null}
      <Display size={size} color={s.text} tracking={0.1} tabular={false}>
        {label}
      </Display>
      {icon && iconRight ? <Icon name={icon} size={size - 4} color={s.text} sw={2.8} /> : null}
    </Chamfer>
  );
}

/** Kleiner eckiger Icon-Button (44 × 44). */
export function IconButton({ icon, onPress, label, color = colors.text }: { icon: string; onPress: () => void; label: string; color?: string }) {
  return (
    <Chamfer cut={9} borderWidth={0} fill={colors.chip} onPress={onPress} accessibilityLabel={label}
      contentStyle={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} color={color} sw={2.2} />
    </Chamfer>
  );
}

export const Spacer = ({ h = 12 }: { h?: number }) => <View style={{ height: h }} />;
