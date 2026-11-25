import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';

export const ICON_PATHS: Record<string, string> = {
  pi: 'M5 7h14 M9 7v11 M15 7v8.5a2.5 2.5 0 0 0 4 2',
  book: 'M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z M5 20.5A2.5 2.5 0 0 0 7.5 23H19v-5',
  globe: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M3 12h18 M12 3c3.2 3.2 3.2 14.8 0 18 M12 3c-3.2 3.2-3.2 14.8 0 18',
  leaf: 'M5 19C5 10.5 10.5 5 19 5c0 8.5-5.5 14-14 14z M5 19L13 11',
  columns: 'M3.5 9L12 4l8.5 5z M6 9v9 M10 9v9 M14 9v9 M18 9v9 M3.5 20.5h17',
  flask: 'M9.5 3h5 M10.5 3v6L5 18.5A2 2 0 0 0 6.8 21.5h10.4a2 2 0 0 0 1.8-3L13.5 9V3 M8 15h8',
  code: 'M8 7l-5 5 5 5 M16 7l5 5-5 5 M14 4.5l-4 15',
  palette:
    'M12 3a9 9 0 1 0 0 18c1.3 0 2-.9 2-1.9 0-.6-.3-1-.6-1.4-.3-.4-.4-.8-.4-1.2 0-1 .8-1.7 1.8-1.7H18a3 3 0 0 0 3-3c0-4.4-4-8.8-9-8.8z M7.5 11.5h.01 M10 7.5h.01 M14.5 7.5h.01',
  note: 'M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  bolt: 'M13 2.5L4.5 14h6.5l-1 7.5L19.5 10H13z',
  chat: 'M4 5h16v11H10l-5 4v-4H4z',
  compass: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M15.5 8.5l-2 5-5 2 2-5z',
  home: 'M4 11l8-7 8 7 M6 9.5V20h12V9.5 M10 20v-5h4v5',
  trophy: 'M8 4h8v6a4 4 0 0 1-8 0z M8 6H4v1.5A3.5 3.5 0 0 0 8 11 M16 6h4v1.5A3.5 3.5 0 0 1 16 11 M12 14v4 M8.5 20h7',
  user: 'M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8z M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6',
  plus: 'M12 5v14 M5 12h14',
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M8 5v14 M16 5v14',
  stop: 'M6 6h12v12H6z',
  close: 'M6 6l12 12 M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  'chevron-right': 'M9 5l7 7-7 7',
  'chevron-left': 'M15 5l-7 7 7 7',
  clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M12 7v5l3 2',
  lock: 'M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  target: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8z M12 12h.01',
  trash: 'M5 7h14 M9 7V4h6v3 M7 7l1 13h8l1-13',
  pencil: 'M4 20l1-5L16 4l4 4L9 19z',
  star: 'M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.7 6.6 19.7l1.2-6.1L3.3 9.4l6.1-.8z',
};

export function Icon({
  name, size = 24, color = colors.cyan, sw = 1.8,
}: { name: string; size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={ICON_PATHS[name] ?? ''} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
