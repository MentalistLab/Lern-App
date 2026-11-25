import { formatNumber, rankFromXp, RANKS, XP_PER_MINUTE } from './ranks';
import { streaks, subjectXp, todaySeconds } from './stats';
import type { Session, Subject } from './store';

export interface Reminder {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const DEFAULT_REMINDER: Reminder = { enabled: false, hour: 18, minute: 0 };

export interface Planned {
  when: Date;
  title: string;
  body: string;
}

interface Input {
  reminder: Reminder;
  sessions: Session[];
  subjects: Subject[];
  dailyGoalMin: number;
  now: number;
}

/** Fach, das nur noch wenige XP vom nächsten Rang oder der nächsten Stufe entfernt ist. */
function nearestStep(subjects: Subject[], sessions: Session[]) {
  let best: { name: string; xpToNext: number; label: string } | null = null;
  for (const s of subjects) {
    const r = rankFromXp(subjectXp(sessions, s.id));
    if (r.rank === 'champion' || !r.nextLabel) continue;
    if (r.xpToNext > 500) continue;
    const label = r.nextIsNewRank && r.nextRank ? RANKS[r.nextRank].name : r.nextLabel;
    if (!best || r.xpToNext < best.xpToNext) best = { name: s.name, xpToNext: r.xpToNext, label };
  }
  return best;
}

/**
 * Plant die Erinnerungen für die nächsten Tage. Heute wird übersprungen, wenn die Uhrzeit
 * vorbei ist oder das Tagesziel schon erreicht wurde.
 */
export function planReminders({ reminder, sessions, subjects, dailyGoalMin, now }: Input, days = 7): Planned[] {
  if (!reminder.enabled || subjects.length === 0) return [];
  const st = streaks(sessions, dailyGoalMin, now);
  const todayMin = Math.floor(todaySeconds(sessions, now) / 60);
  const near = nearestStep(subjects, sessions);
  const out: Planned[] = [];
  const base = new Date(now);

  for (let d = 0; d < days; d++) {
    const when = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d, reminder.hour, reminder.minute, 0);
    if (when.getTime() <= now + 30_000) continue;
    if (d === 0 && st.todayDone) continue;

    let title = 'Zeit für deine Session';
    let body = `Dein Tagesziel: ${dailyGoalMin} Min. Jede Minute bringt ${XP_PER_MINUTE} XP.`;

    if (d === 0) {
      const left = Math.max(1, dailyGoalMin - todayMin);
      if (st.current > 0) {
        title = `Dein Streak von ${st.current} ${st.current === 1 ? 'Tag' : 'Tagen'} steht auf dem Spiel`;
        body = `Noch ${left} Min bis zum Tagesziel.`;
      } else if (todayMin > 0) {
        body = `Noch ${left} Min bis zum Tagesziel.`;
      }
    }
    if (near) {
      body = `Noch ${formatNumber(near.xpToNext)} XP bis ${near.label} in ${near.name}.`;
    }
    out.push({ when, title, body });
  }
  return out;
}
