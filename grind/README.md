# Grind

Fokus- und Lern-App für Schüler: Jedes Fach hat einen eigenen Rang (Bronze → Silber → Gold → Platin → Diamant → Master → Champion, je 3 Stufen), und man steigt durch konzentrierte Lernzeit auf. **1 Minute Fokus = 10 XP.**

Expo (React Native) + TypeScript + Expo Router. Läuft auf iOS, Android und im Browser.

## Starten

```bash
cd grind
npm install
npx expo start          # QR-Code mit Expo Go scannen, oder i / a / w drücken
npx expo start --web    # im Browser (am besten im Handy-Format)
```

Prüfen:

```bash
npm run typecheck       # TypeScript
npx expo-doctor         # Projekt-Check
```

## Was die App kann

| Screen | Datei |
| --- | --- |
| Onboarding (Prinzip, XP, Fächer, Tagesziel) | `src/app/onboarding.tsx` |
| Home: Streak, Tagesziel-Ring, Fach-Karten | `src/screens/HomeTab.tsx` |
| Fach-Detail: Emblem, XP-Balken, Wochen-Diagramm | `src/app/subject/[id].tsx` |
| Fokus-Timer (Dauer wählen, Pause, Stopp) | `src/app/timer/[id].tsx` |
| Session beendet mit animiertem Balken | `src/app/done.tsx` |
| Rang- und Stufen-Aufstieg | `src/app/rankup.tsx` |
| Alle Ränge je Fach (gesperrte abgedunkelt) | `src/screens/RanksTab.tsx` |
| Profil: Gesamtzeit, Streak, stärkstes Fach, Heatmap | `src/screens/ProfileTab.tsx` |
| Fach hinzufügen, bearbeiten, löschen | `src/app/subject-form.tsx` |

Alles wird lokal auf dem Gerät gespeichert (AsyncStorage, Schlüssel `grind.v1`). Es gibt kein Konto und keinen Server.

## Spielregeln (`src/ranks.ts`)

- 1 Minute Fokus = 10 XP (`XP_PER_MINUTE`).
- XP pro Stufe: Bronze 1.000, Silber 1.500, Gold 2.000, Platin 3.000, Diamant 4.000, Master 5.000. Jeder Rang hat 3 Stufen (I–III).
- Champion beginnt bei 49.500 XP (etwa 82 Std Fokuszeit) und hat keine Stufen.
- Ein Tag zählt für den Streak, wenn die Lernzeit aller Fächer das Tagesziel erreicht.
- Verlässt man die App während einer Session, pausiert der Timer. Der Bildschirm bleibt während des Fokus an.
- Sessions unter 6 Sekunden geben keine XP und werden nicht gespeichert.

Die Zahlen sind Platzhalter und lassen sich in `RANKS` (`tierXp`) anpassen.

## Aufbau

```
src/
  app/            Routen (Expo Router): onboarding, home, subject/[id], timer/[id], done, rankup, subject-form
  screens/        Inhalte der drei Tabs (Fächer, Ränge, Profil)
  components/
    Emblem.tsx    Die 7 Rang-Embleme als SVG (viewBox 200 × 200), locked-Variante
    Chamfer.tsx   Eckig geschnittene Flächen mit Verlaufsrahmen (SVG-Polygon statt clip-path)
    Flame, Ring, Rays, ProgressBar, Button, Icon, TabBar, SubjectCard, Backdrop, Typo
  ranks.ts        Rang- und XP-Logik
  stats.ts        Streaks, Wochen- und Heatmap-Auswertung
  store.tsx       Zustand und Speicherung
  theme.ts        Farben, Schriften, Vorlagen für Fächer
```

Design-Tokens (Farben, Schriften) stehen in `src/theme.ts` und `src/ranks.ts`. Schriften: Big Shoulders (Zahlen, Ränge, Titel) und Figtree (Text), geladen über `@expo-google-fonts`.

## Bekannte Grenzen

- Glow-Effekte nutzen `shadow*`-Eigenschaften. Auf Android werden sie nicht überall so weich dargestellt wie auf iOS und im Web.
- Die Gold-Verläufe in den Titeln des Rang-Aufstiegs sind einfarbig mit Leuchten, weil React Native keinen Text-Verlauf kennt.
- Erinnerungen per Push-Benachrichtigung gibt es noch nicht.
