export const colors = {
  void: '#04060C',
  screen: '#060A16',
  card: '#101B3B',
  cardDeep: '#0A1228',
  chip: '#0E1730',
  track: '#16234A',
  line: '#1F2F5C',
  lineHi: '#2A4380',
  text: '#EAF3FF',
  text2: '#B4C4E2',
  muted: '#9DB2D6',
  quiet: '#8093B8',
  cyan: '#22D8FF',
  cyanHi: '#6BEBFF',
  cyanDeep: '#0EA5E9',
  blue: '#2F6BFF',
  flame: '#FF8A1F',
  flameSoft: '#FFB36B',
  stop: '#FF5D73',
  ink: '#03131F',
};

export const fonts = {
  display: 'BigShoulders_900Black',
  displayBold: 'BigShoulders_800ExtraBold',
  body: 'Figtree_400Regular',
  bodyMed: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
};

export const SUBJECT_COLORS = [
  { key: 'cyan', name: 'Cyan', hex: '#22D8FF' },
  { key: 'blue', name: 'Blau', hex: '#4D7CFF' },
  { key: 'violet', name: 'Violett', hex: '#A78BFF' },
  { key: 'pink', name: 'Pink', hex: '#FF6FB5' },
  { key: 'red', name: 'Rot', hex: '#FF5D73' },
  { key: 'orange', name: 'Orange', hex: '#FF9A3D' },
  { key: 'lime', name: 'Limette', hex: '#B6F24A' },
  { key: 'teal', name: 'Türkis', hex: '#35E0C2' },
] as const;

export const SUBJECT_ICONS = [
  'pi', 'book', 'globe', 'leaf', 'columns', 'flask',
  'code', 'palette', 'note', 'bolt', 'chat', 'compass',
] as const;

export const ICON_LABELS: Record<string, string> = {
  pi: 'Pi', book: 'Buch', globe: 'Globus', leaf: 'Blatt', columns: 'Säulen', flask: 'Kolben',
  code: 'Code', palette: 'Palette', note: 'Note', bolt: 'Blitz', chat: 'Sprechblase', compass: 'Kompass',
};

/** Fächer, die im Onboarding zur Auswahl stehen. */
export const PRESET_SUBJECTS = [
  { name: 'Mathe', icon: 'pi', color: '#FFC233' },
  { name: 'Deutsch', icon: 'book', color: '#C2CEDE' },
  { name: 'Englisch', icon: 'chat', color: '#35E0C2' },
  { name: 'Bio', icon: 'leaf', color: '#B6F24A' },
  { name: 'Geschichte', icon: 'columns', color: '#7DB4FF' },
  { name: 'Physik', icon: 'bolt', color: '#22D8FF' },
  { name: 'Chemie', icon: 'flask', color: '#FF9A3D' },
  { name: 'Informatik', icon: 'code', color: '#A78BFF' },
  { name: 'Kunst', icon: 'palette', color: '#FF6FB5' },
  { name: 'Musik', icon: 'note', color: '#FF5D73' },
  { name: 'Erdkunde', icon: 'compass', color: '#4D7CFF' },
] as const;

export const DAILY_GOALS = [
  { min: 15, label: 'Locker' },
  { min: 30, label: 'Solide' },
  { min: 45, label: 'Ambitioniert' },
  { min: 90, label: 'Grind-Modus' },
] as const;

export const TIMER_PRESETS = [15, 25, 45, 60] as const;

/** "#RRGGBB" + Alpha (0–1) -> rgba()-String */
export const withAlpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};
