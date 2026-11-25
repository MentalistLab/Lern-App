import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { rankFromXp, xpForSeconds, type RankState } from './ranks';
import { subjectXp } from './stats';

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Session {
  id: string;
  subjectId: string;
  startedAt: number;
  seconds: number;
  xp: number;
}

interface PersistedState {
  onboarded: boolean;
  userName: string;
  dailyGoalMin: number;
  subjects: Subject[];
  sessions: Session[];
}

const KEY = 'grind.v1';

const initial: PersistedState = {
  onboarded: false,
  userName: 'Spieler',
  dailyGoalMin: 45,
  subjects: [],
  sessions: [],
};

export interface SessionResult {
  session: Session;
  before: RankState;
  after: RankState;
}

interface Store extends PersistedState {
  ready: boolean;
  completeOnboarding: (subjects: Omit<Subject, 'id'>[], dailyGoalMin: number) => void;
  addSubject: (s: Omit<Subject, 'id'>) => string;
  updateSubject: (id: string, patch: Partial<Omit<Subject, 'id'>>) => void;
  deleteSubject: (id: string) => void;
  recordSession: (subjectId: string, seconds: number, startedAt: number) => SessionResult | null;
  setDailyGoal: (min: number) => void;
  setUserName: (name: string) => void;
  resetAll: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(initial);
  const [ready, setReady] = useState(false);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<PersistedState>;
            setState({ ...initial, ...parsed });
          } catch {
            /* defekte Daten ignorieren */
          }
        }
      })
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const completeOnboarding = useCallback((subjects: Omit<Subject, 'id'>[], dailyGoalMin: number) => {
    setState((s) => ({
      ...s,
      onboarded: true,
      dailyGoalMin,
      subjects: subjects.map((x) => ({ ...x, id: uid() })),
    }));
  }, []);

  const addSubject = useCallback((sub: Omit<Subject, 'id'>) => {
    const id = uid();
    setState((s) => ({ ...s, subjects: [...s.subjects, { ...sub, id }] }));
    return id;
  }, []);

  const updateSubject = useCallback((id: string, patch: Partial<Omit<Subject, 'id'>>) => {
    setState((s) => ({ ...s, subjects: s.subjects.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      subjects: s.subjects.filter((x) => x.id !== id),
      sessions: s.sessions.filter((x) => x.subjectId !== id),
    }));
  }, []);

  const recordSession = useCallback((subjectId: string, seconds: number, startedAt: number) => {
    const cur = ref.current;
    const xp = xpForSeconds(seconds);
    if (seconds < 1 || !cur.subjects.some((x) => x.id === subjectId)) return null;
    const before = rankFromXp(subjectXp(cur.sessions, subjectId));
    const session: Session = { id: uid(), subjectId, startedAt, seconds: Math.round(seconds), xp };
    const after = rankFromXp(before.xp + xp);
    setState((s) => ({ ...s, sessions: [...s.sessions, session] }));
    return { session, before, after };
  }, []);

  const setDailyGoal = useCallback((min: number) => setState((s) => ({ ...s, dailyGoalMin: min })), []);
  const setUserName = useCallback((name: string) => setState((s) => ({ ...s, userName: name })), []);
  const resetAll = useCallback(async () => {
    await AsyncStorage.removeItem(KEY);
    setState(initial);
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state, ready, completeOnboarding, addSubject, updateSubject, deleteSubject,
      recordSession, setDailyGoal, setUserName, resetAll,
    }),
    [state, ready, completeOnboarding, addSubject, updateSubject, deleteSubject, recordSession, setDailyGoal, setUserName, resetAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore außerhalb des StoreProvider');
  return v;
}
