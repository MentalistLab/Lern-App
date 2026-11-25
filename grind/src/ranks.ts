export type RankKey = 'bronze' | 'silber' | 'gold' | 'platin' | 'diamant' | 'master' | 'champion';

export const RANK_ORDER: RankKey[] = ['bronze', 'silber', 'gold', 'platin', 'diamant', 'master', 'champion'];

export const XP_PER_MINUTE = 10;
export const xpForSeconds = (seconds: number) => Math.floor((seconds * XP_PER_MINUTE) / 60);

export interface RankMeta {
  key: RankKey;
  name: string;
  main: string;
  text: string;
  light: string;
  dark: string;
  barFrom: string;
  barTo: string;
  /** XP, die eine einzelne Stufe (I–III) kostet. Champion hat keine Stufen. */
  tierXp: number;
  /** XP, ab der der Rang beginnt. */
  startXp: number;
  detail: string;
}

const base: Omit<RankMeta, 'startXp'>[] = [
  { key: 'bronze', name: 'Bronze', main: '#D2843F', text: '#E39A5A', light: '#F5B678', dark: '#6E3412', barFrom: '#8F4A1E', barTo: '#E39A5A', tierXp: 1000, detail: 'Schlichtes Schild' },
  { key: 'silber', name: 'Silber', main: '#C2CEDE', text: '#C2CEDE', light: '#FAFCFF', dark: '#5F6E88', barFrom: '#7C8BA6', barTo: '#E6EDF8', tierXp: 1500, detail: 'Schild mit Schultern' },
  { key: 'gold', name: 'Gold', main: '#FFC233', text: '#FFC233', light: '#FFF1A6', dark: '#A5600A', barFrom: '#B87A0E', barTo: '#FFC233', tierXp: 2000, detail: 'Schild mit Flügeln' },
  { key: 'platin', name: 'Platin', main: '#35E0C2', text: '#35E0C2', light: '#D9FFF8', dark: '#0B6B66', barFrom: '#0B8F7C', barTo: '#35E0C2', tierXp: 3000, detail: 'Achteck-Wappen mit Gem' },
  { key: 'diamant', name: 'Diamant', main: '#5EA2FF', text: '#7DB4FF', light: '#C9E0FF', dark: '#1C3F9E', barFrom: '#2F6BFF', barTo: '#7DB4FF', tierXp: 4000, detail: 'Facettierter Edelstein' },
  { key: 'master', name: 'Master', main: '#C45BFF', text: '#C45BFF', light: '#F6D9FF', dark: '#4A178F', barFrom: '#7A2BD0', barTo: '#C45BFF', tierXp: 5000, detail: 'Zackenkrone mit Energie-Orb' },
  { key: 'champion', name: 'Champion', main: '#FF4A6E', text: '#FF4A6E', light: '#FFF6C4', dark: '#5E0B2A', barFrom: '#B01F45', barTo: '#FF4A6E', tierXp: 0, detail: 'Krone und Strahlenkranz' },
];

let acc = 0;
export const RANKS: Record<RankKey, RankMeta> = {} as Record<RankKey, RankMeta>;
for (const r of base) {
  RANKS[r.key] = { ...r, startXp: acc };
  acc += r.tierXp * 3;
}
/** Ab dieser XP-Zahl ist man Champion. */
export const CHAMPION_XP = RANKS.champion.startXp;

export const ROMAN = ['', 'I', 'II', 'III'];

export interface RankState {
  rank: RankKey;
  /** 1–3, bei Champion 0 */
  tier: number;
  label: string;
  xp: number;
  xpIntoTier: number;
  tierXp: number;
  pct: number;
  xpToNext: number;
  nextLabel: string | null;
  nextRank: RankKey | null;
  nextIsNewRank: boolean;
  /** Fortlaufende Nummer der Stufe (0 = Bronze I … 18 = Champion). */
  step: number;
}

export function rankFromXp(xpRaw: number): RankState {
  const xp = Math.max(0, Math.floor(xpRaw));
  if (xp >= CHAMPION_XP) {
    return {
      rank: 'champion', tier: 0, label: 'Champion', xp, xpIntoTier: 0, tierXp: 0, pct: 1,
      xpToNext: 0, nextLabel: null, nextRank: null, nextIsNewRank: false, step: 18,
    };
  }
  let idx = 0;
  for (let i = 0; i < RANK_ORDER.length - 1; i++) {
    if (xp >= RANKS[RANK_ORDER[i]].startXp) idx = i;
  }
  const key = RANK_ORDER[idx];
  const meta = RANKS[key];
  const into = xp - meta.startXp;
  const tierIdx = Math.min(2, Math.floor(into / meta.tierXp));
  const xpIntoTier = into - tierIdx * meta.tierXp;
  const tier = tierIdx + 1;
  const nextRank = tier === 3 ? RANK_ORDER[idx + 1] : key;
  const nextTier = tier === 3 ? 1 : tier + 1;
  const nextLabel = nextRank === 'champion' ? 'Champion' : `${RANKS[nextRank].name} ${ROMAN[nextTier]}`;
  return {
    rank: key, tier, label: `${meta.name} ${ROMAN[tier]}`, xp, xpIntoTier, tierXp: meta.tierXp,
    pct: xpIntoTier / meta.tierXp, xpToNext: meta.tierXp - xpIntoTier, nextLabel, nextRank,
    nextIsNewRank: tier === 3, step: idx * 3 + tierIdx,
  };
}

export const formatNumber = (n: number) => Math.round(n).toLocaleString('de-DE');
