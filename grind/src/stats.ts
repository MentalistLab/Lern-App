import type { Session } from './store';

const pad = (n: number) => String(n).padStart(2, '0');

export const dayKey = (t: number | Date) => {
  const d = typeof t === 'number' ? new Date(t) : t;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const addDays = (key: string, n: number) => {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
};

export function secondsByDay(sessions: Session[], subjectId?: string) {
  const out: Record<string, number> = {};
  for (const s of sessions) {
    if (subjectId && s.subjectId !== subjectId) continue;
    const k = dayKey(s.startedAt);
    out[k] = (out[k] ?? 0) + s.seconds;
  }
  return out;
}

export const subjectXp = (sessions: Session[], subjectId: string) =>
  sessions.reduce((sum, s) => (s.subjectId === subjectId ? sum + s.xp : sum), 0);

export const totalXp = (sessions: Session[]) => sessions.reduce((sum, s) => sum + s.xp, 0);
export const totalSeconds = (sessions: Session[]) => sessions.reduce((sum, s) => sum + s.seconds, 0);

export function todaySeconds(sessions: Session[], now = Date.now()) {
  return secondsByDay(sessions)[dayKey(now)] ?? 0;
}

export function streaks(sessions: Session[], goalMin: number, now = Date.now()) {
  const days = secondsByDay(sessions);
  const reached = (k: string) => (days[k] ?? 0) >= goalMin * 60;
  const today = dayKey(now);
  const todayDone = reached(today);

  let current = 0;
  let k = todayDone ? today : addDays(today, -1);
  while (reached(k)) {
    current++;
    k = addDays(k, -1);
  }

  const keys = Object.keys(days).filter(reached).sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of keys) {
    run = prev && addDays(prev, 1) === key ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = key;
  }
  return { current, longest: Math.max(longest, current), todayDone };
}

/** Montag bis Sonntag der aktuellen Woche (Tagesschlüssel). */
export function weekKeys(now = Date.now()) {
  const d = new Date(now);
  const offset = (d.getDay() + 6) % 7;
  const monday = dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function weekMinutes(sessions: Session[], subjectId?: string, now = Date.now()) {
  const days = secondsByDay(sessions, subjectId);
  return weekKeys(now).map((k) => Math.round((days[k] ?? 0) / 60));
}

/** Aktivität der letzten 28 Tage: 0 = nichts, 1–3 = Anteil vom Tagesziel. */
export function heatmap(sessions: Session[], goalMin: number, now = Date.now()) {
  const days = secondsByDay(sessions);
  const today = dayKey(now);
  return Array.from({ length: 28 }, (_, i) => {
    const k = addDays(today, i - 27);
    const min = (days[k] ?? 0) / 60;
    if (min <= 0) return 0;
    const r = min / goalMin;
    return r >= 1 ? 3 : r >= 0.5 ? 2 : 1;
  });
}

export function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const h = Math.floor(m / 60);
  return { h, m: m % 60 };
}

export const clock = (sec: number) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};

export const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const todayIndex = (now = Date.now()) => (new Date(now).getDay() + 6) % 7;
