import React from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { Backdrop } from './Backdrop';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  /** Es folgt unten eine Tab-Bar, daher weniger Abstand. */
  tabbed?: boolean;
  padX?: number;
  backdrop?: React.ComponentProps<typeof Backdrop>;
  style?: StyleProp<ViewStyle>;
  /** Inhalt über dem Scroll-Bereich (z. B. fester Button unten). */
  footer?: React.ReactNode;
}

export function Screen({ children, scroll = false, tabbed = false, padX = 18, backdrop, style, footer }: Props) {
  const insets = useSafeAreaInsets();
  const top = insets.top + 10;
  const bottom = tabbed ? 16 : Math.max(insets.bottom, 14) + 20;
  return (
    <View style={[{ flex: 1, backgroundColor: colors.screen, overflow: 'hidden' }, style]}>
      <Backdrop {...backdrop} />
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: top, paddingBottom: footer ? 16 : bottom, paddingHorizontal: padX }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: top, paddingBottom: footer ? 16 : bottom, paddingHorizontal: padX }}>{children}</View>
      )}
      {footer ? <View style={{ paddingHorizontal: padX, paddingBottom: Math.max(insets.bottom, 14) + 20 }}>{footer}</View> : null}
    </View>
  );
}
