import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, fonts } from '../theme';

interface DisplayProps extends TextProps {
  size?: number;
  color?: string;
  /** Schräglage in Grad (negativ = nach rechts geneigt), wie im Design. */
  skew?: number;
  tracking?: number;
  glow?: string;
  align?: TextStyle['textAlign'];
  tabular?: boolean;
}

/** Big Shoulders 900, Versalien: Zahlen, Ränge, Titel. */
export function Display({
  size = 24, color = colors.text, skew = 0, tracking = 0.02, glow, align, tabular = true, style, ...rest
}: DisplayProps) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fonts.display,
          fontSize: size,
          lineHeight: Math.round(size * 1.08),
          color,
          textTransform: 'uppercase',
          letterSpacing: size * tracking,
          textAlign: align,
          fontVariant: tabular ? ['tabular-nums'] : undefined,
          transform: skew ? [{ skewX: `${skew}deg` }] : undefined,
          textShadowColor: glow,
          textShadowRadius: glow ? Math.max(8, size * 0.28) : 0,
          textShadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

interface BodyProps extends TextProps {
  size?: number;
  color?: string;
  weight?: 'reg' | 'med' | 'semi' | 'bold';
  align?: TextStyle['textAlign'];
  tracking?: number;
  lineHeight?: number;
}

const family = { reg: fonts.body, med: fonts.bodyMed, semi: fonts.bodySemi, bold: fonts.bodyBold };

/** Figtree: Fließtext und kleine Beschriftungen (nie unter 12). */
export function Body({
  size = 15, color = colors.text2, weight = 'reg', align, tracking, lineHeight, style, ...rest
}: BodyProps) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: family[weight],
          fontSize: size,
          lineHeight: lineHeight ?? Math.round(size * 1.4),
          color,
          textAlign: align,
          letterSpacing: tracking,
          fontVariant: ['tabular-nums'],
        },
        style,
      ]}
    />
  );
}

/** Kleine Versal-Beschriftung mit Abstand, z. B. "VORSCHAU". */
export function Eyebrow({ children, color = colors.muted, style }: { children: React.ReactNode; color?: string; style?: TextStyle }) {
  return (
    <Body size={12} weight="bold" color={color} tracking={1.9} style={style}>
      {children}
    </Body>
  );
}
