import React, { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  /** Glow oben (Standard: Cyan). */
  top?: string;
  topOpacity?: number;
  /** Glow unten rechts (Standard: Blau). */
  bottom?: string;
  /** Zusätzlicher Glow in der Mitte, z. B. Gold beim Rang-Aufstieg. */
  center?: string;
  centerY?: string;
  centerOpacity?: number;
  base?: string;
  stripes?: boolean;
}

/** Atmosphäre hinter jedem Screen: fast schwarz, Cyan-Glow, feine Diagonalen. */
export function Backdrop({
  top = colors.cyan, topOpacity = 0.2, bottom = colors.blue, center, centerY = '45%', centerOpacity = 0.3,
  base = colors.screen, stripes = true,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <RadialGradient id={`${uid}a`} cx="50%" cy="0%" rx="100%" ry="42%">
          <Stop offset="0" stopColor={top} stopOpacity={topOpacity} />
          <Stop offset="1" stopColor={top} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${uid}b`} cx="100%" cy="100%" rx="75%" ry="38%">
          <Stop offset="0" stopColor={bottom} stopOpacity={0.16} />
          <Stop offset="1" stopColor={bottom} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${uid}c`} cx="50%" cy={centerY} rx="85%" ry="40%">
          <Stop offset="0" stopColor={center ?? '#000'} stopOpacity={centerOpacity} />
          <Stop offset="1" stopColor={center ?? '#000'} stopOpacity={0} />
        </RadialGradient>
        <Pattern id={`${uid}p`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
          <Rect x="0" y="0" width="1" height="16" fill="#FFFFFF" fillOpacity={0.022} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={base} />
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${uid}a)`} />
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${uid}b)`} />
      {center ? <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${uid}c)`} /> : null}
      {stripes ? <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${uid}p)`} /> : null}
    </Svg>
  );
}
