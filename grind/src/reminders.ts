import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { planReminders, type Reminder } from './reminderPlan';
import { useStore } from './store';

/** Lokale Erinnerungen gibt es nur in der Handy-App, nicht im Browser. */
export const remindersSupported = Platform.OS !== 'web';

const CHANNEL = 'reminders';

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Erinnerungen',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#22D8FF',
  });
}

/** Fragt bei Bedarf nach der Erlaubnis. Gibt zurück, ob Benachrichtigungen erlaubt sind. */
export async function requestReminderPermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  try {
    await ensureChannel();
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    const res = await Notifications.requestPermissionsAsync();
    return res.granted;
  } catch {
    return false;
  }
}

async function apply(input: Parameters<typeof planReminders>[0]) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const plan = planReminders(input);
  if (plan.length === 0) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;
  await ensureChannel();
  for (const p of plan) {
    await Notifications.scheduleNotificationAsync({
      content: { title: p.title, body: p.body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.when, channelId: CHANNEL },
    });
  }
}

/**
 * Hält die geplanten Erinnerungen aktuell: bei jeder Session, bei Änderung von Ziel oder Uhrzeit
 * und wenn die App wieder in den Vordergrund kommt (Tageswechsel).
 */
export function useReminderSync() {
  const { ready, onboarded, reminder, sessions, subjects, dailyGoalMin } = useStore();

  useEffect(() => {
    if (!remindersSupported || !ready || !onboarded) return;
    const run = () => apply({ reminder, sessions, subjects, dailyGoalMin, now: Date.now() }).catch(() => {});
    run();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && run());
    return () => sub.remove();
  }, [ready, onboarded, reminder, sessions, subjects, dailyGoalMin]);
}

export type { Reminder };
