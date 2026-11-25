import React, { useId } from 'react';
import Svg, {
  Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop,
} from 'react-native-svg';
import type { RankKey } from '../ranks';

type K = (c: string) => string;

/** Gesperrte Ränge: alle Farben werden zu dunklem Grau. */
const gray = (hex: string) => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  const l = Math.round((0.299 * r + 0.587 * g + 0.114 * b) * 0.4);
  return '#' + [l, l, l].map((x) => x.toString(16).padStart(2, '0')).join('');
};

type Stops = [number, string, number?][];

function LG({ id, k, stops, v = false }: { id: string; k: K; stops: Stops; v?: boolean }) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2={v ? '0' : '1'} y2="1">
      {stops.map(([o, c, op], i) => (
        <Stop key={i} offset={o} stopColor={k(c)} stopOpacity={op ?? 1} />
      ))}
    </LinearGradient>
  );
}

function RG({ id, k, stops }: { id: string; k: K; stops: Stops }) {
  return (
    <RadialGradient id={id} cx="50%" cy="50%" r="50%">
      {stops.map(([o, c, op], i) => (
        <Stop key={i} offset={o} stopColor={k(c)} stopOpacity={op ?? 1} />
      ))}
    </RadialGradient>
  );
}

const Mirror = ({ children }: { children: React.ReactNode }) => (
  <>
    <G>{children}</G>
    <G transform="translate(200 0) scale(-1 1)">{children}</G>
  </>
);

const spark = (x: number, y: number, r: number) => {
  const q = r * 0.25;
  return `M${x} ${y - r} L${x + q} ${y - q} L${x + r} ${y} L${x + q} ${y + q} L${x} ${y + r} L${x - q} ${y + q} L${x - r} ${y} L${x - q} ${y - q} Z`;
};

interface P { k: K; u: string }

function Bronze({ k, u }: P) {
  return (
    <>
      <Defs>
        <RG id={`${u}glow`} k={k} stops={[[0, '#D2843F', 0.55], [1, '#D2843F', 0]]} />
        <LG id={`${u}body`} k={k} stops={[[0, '#F5B678'], [0.5, '#C06C2B'], [1, '#6E3412']]} />
        <LG id={`${u}rim`} k={k} v stops={[[0, '#FFD9AE'], [1, '#8F4A1E']]} />
      </Defs>
      <Circle cx="100" cy="100" r="96" fill={`url(#${u}glow)`} />
      <Path d="M100 26 L156 44 L156 100 Q156 140 100 174 Q44 140 44 100 L44 44 Z" fill={`url(#${u}body)`} stroke={`url(#${u}rim)`} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M100 40 L144 54 L144 99 Q144 130 100 156 Q56 130 56 99 L56 54 Z" fill={k('#3A1B09')} fillOpacity={0.45} stroke={k('#FFD9AE')} strokeOpacity={0.5} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M44 44 L100 26 L100 100 L44 100 Z" fill="#FFFFFF" fillOpacity={0.1} />
      <Path d="M76 106 L100 84 L124 106" fill="none" stroke={k('#FFE5C8')} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="100" cy="126" r="6" fill={k('#FFE5C8')} />
    </>
  );
}

function Silber({ k, u }: P) {
  const w = k('#F4F8FF');
  return (
    <>
      <Defs>
        <RG id={`${u}glow`} k={k} stops={[[0, '#C2CEDE', 0.55], [1, '#C2CEDE', 0]]} />
        <LG id={`${u}body`} k={k} stops={[[0, '#FAFCFF'], [0.5, '#B9C5D8'], [1, '#5F6E88']]} />
        <LG id={`${u}rim`} k={k} v stops={[[0, '#FFFFFF'], [1, '#7C8BA6']]} />
      </Defs>
      <Circle cx="100" cy="100" r="98" fill={`url(#${u}glow)`} />
      <Path d="M100 22 L128 34 L160 30 L160 98 Q160 142 100 180 Q40 142 40 98 L40 30 L72 34 Z" fill={`url(#${u}body)`} stroke={`url(#${u}rim)`} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M100 38 L124 48 L148 44 L148 97 Q148 134 100 164 Q52 134 52 97 L52 44 L76 48 Z" fill={k('#1A2438')} fillOpacity={0.5} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M40 30 L72 34 L100 22 L100 100 L40 98 Z" fill="#FFFFFF" fillOpacity={0.1} />
      <Path d="M72 84 L100 62 L128 84" fill="none" stroke={w} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M72 108 L100 86 L128 108" fill="none" stroke={w} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M100 120 L109 131 L100 142 L91 131 Z" fill={w} />
      <Circle cx="62" cy="60" r="3.5" fill="#FFFFFF" fillOpacity={0.8} />
      <Circle cx="138" cy="60" r="3.5" fill="#FFFFFF" fillOpacity={0.8} />
    </>
  );
}

function Gold({ k, u }: P) {
  const rim = k('#FFF3B8');
  return (
    <>
      <Defs>
        <RG id={`${u}glow`} k={k} stops={[[0, '#FFC233', 0.6], [1, '#FFC233', 0]]} />
        <LG id={`${u}body`} k={k} stops={[[0, '#FFF1A6'], [0.5, '#FFC233'], [1, '#A5600A']]} />
        <LG id={`${u}wing`} k={k} stops={[[0, '#FFF3B0'], [0.55, '#F2B21F'], [1, '#A8650A']]} />
        <LG id={`${u}star`} k={k} v stops={[[0, '#FFFFFF'], [1, '#FFD35A']]} />
      </Defs>
      <Circle cx="100" cy="100" r="99" fill={`url(#${u}glow)`} />
      <Mirror>
        <Path d="M48 84 C30 84 12 72 4 50 C18 58 30 60 42 58 C28 50 20 40 16 26 C30 38 42 44 54 46 Z" fill={`url(#${u}wing)`} stroke={k('#FFE48A')} strokeWidth={1.5} strokeLinejoin="round" />
        <Path d="M50 100 C34 104 20 98 10 84 C22 88 34 88 48 86 Z" fill={`url(#${u}wing)`} stroke={k('#FFE48A')} strokeWidth={1.5} strokeLinejoin="round" />
      </Mirror>
      <Path d="M100 20 L154 38 L154 98 Q154 144 100 178 Q46 144 46 98 L46 38 Z" fill={`url(#${u}body)`} stroke={rim} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M100 34 L142 48 L142 97 Q142 132 100 158 Q58 132 58 97 L58 48 Z" fill={k('#4A2A00')} fillOpacity={0.38} stroke={rim} strokeOpacity={0.6} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M46 38 L100 20 L100 98 L46 98 Z" fill="#FFFFFF" fillOpacity={0.1} />
      <Path d="M100 8 L108 20 L100 28 L92 20 Z" fill={rim} />
      <Polygon points="100,72 106.5,89.1 124.7,90 110.5,101.4 115.3,119 100,109 84.7,119 89.5,101.4 75.3,90 93.5,89.1" fill={`url(#${u}star)`} stroke={rim} strokeWidth={1.5} strokeLinejoin="round" />
      <Circle cx="64" cy="64" r="3.5" fill={rim} fillOpacity={0.85} />
      <Circle cx="136" cy="64" r="3.5" fill={rim} fillOpacity={0.85} />
    </>
  );
}

function Platin({ k, u }: P) {
  const l = k('#D9FFF8');
  return (
    <>
      <Defs>
        <RG id={`${u}glow`} k={k} stops={[[0, '#35E0C2', 0.6], [1, '#35E0C2', 0]]} />
        <LG id={`${u}body`} k={k} stops={[[0, '#D9FFF8'], [0.5, '#35E0C2'], [1, '#0B6B66']]} />
        <LG id={`${u}wing`} k={k} stops={[[0, '#CFFFF6'], [0.55, '#35E0C2'], [1, '#0A6F6A']]} />
      </Defs>
      <Circle cx="100" cy="100" r="99" fill={`url(#${u}glow)`} />
      <Mirror>
        <Path d="M52 90 C30 92 10 80 2 48 C16 58 28 62 42 60 C26 50 18 36 16 18 C30 34 42 42 56 46 Z" fill={`url(#${u}wing)`} stroke={l} strokeWidth={1.5} strokeLinejoin="round" />
        <Path d="M54 106 C36 112 18 106 6 88 C20 92 34 92 48 88 Z" fill={`url(#${u}wing)`} stroke={l} strokeWidth={1.5} strokeLinejoin="round" />
        <Path d="M56 120 C42 126 28 124 16 114 C28 114 40 112 52 106 Z" fill={`url(#${u}wing)`} stroke={l} strokeWidth={1.5} strokeLinejoin="round" />
      </Mirror>
      <Path d="M86 24 L100 4 L114 24 Z" fill={l} stroke={l} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M74 22 L126 22 L158 50 L158 108 Q158 148 100 182 Q42 148 42 108 L42 50 Z" fill={`url(#${u}body)`} stroke={l} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M78 36 L122 36 L146 58 L146 106 Q146 136 100 162 Q54 136 54 106 L54 58 Z" fill={k('#032B2E')} fillOpacity={0.55} stroke={l} strokeOpacity={0.6} strokeWidth={2} strokeLinejoin="round" />
      <G stroke={k('#E6FFFB')} strokeWidth={0.8} strokeOpacity={0.7} strokeLinejoin="round">
        <Path d="M100 74 L122.5 87 L100 100 Z" fill={k('#F2FFFC')} />
        <Path d="M100 74 L77.5 87 L100 100 Z" fill={k('#C5FBF1')} />
        <Path d="M122.5 87 L122.5 113 L100 100 Z" fill={k('#6FE9D3')} />
        <Path d="M77.5 87 L77.5 113 L100 100 Z" fill={k('#3CD2BA')} />
        <Path d="M122.5 113 L100 126 L100 100 Z" fill={k('#1EA793')} />
        <Path d="M77.5 113 L100 126 L100 100 Z" fill={k('#137F73')} />
      </G>
      <Circle cx="60" cy="66" r="3.5" fill={l} fillOpacity={0.85} />
      <Circle cx="140" cy="66" r="3.5" fill={l} fillOpacity={0.85} />
      <Circle cx="100" cy="148" r="3.5" fill={l} fillOpacity={0.85} />
    </>
  );
}

function Diamant({ k, u }: P) {
  return (
    <>
      <Defs>
        <RG id={`${u}glow`} k={k} stops={[[0, '#5EA2FF', 0.65], [1, '#5EA2FF', 0]]} />
        <LG id={`${u}wing`} k={k} stops={[[0, '#C9E0FF'], [0.55, '#5EA2FF'], [1, '#1C3F9E']]} />
      </Defs>
      <Circle cx="100" cy="100" r="100" fill={`url(#${u}glow)`} />
      <Mirror>
        <Path d="M40 92 C22 90 8 76 2 54 C14 62 26 64 38 62 C24 52 18 38 18 22 C30 36 40 44 54 48 Z" fill={`url(#${u}wing)`} stroke={k('#DCEBFF')} strokeWidth={1.5} strokeLinejoin="round" />
        <Path d="M42 106 C26 110 12 104 4 90 C16 94 28 94 42 92 Z" fill={`url(#${u}wing)`} stroke={k('#DCEBFF')} strokeWidth={1.5} strokeLinejoin="round" />
        <Path d="M46 118 C34 124 22 122 14 112 C24 112 36 110 46 104 Z" fill={`url(#${u}wing)`} stroke={k('#DCEBFF')} strokeWidth={1.5} strokeLinejoin="round" />
      </Mirror>
      <G stroke="#FFFFFF" strokeWidth={1.4} strokeOpacity={0.65} strokeLinejoin="round">
        <Path d="M70 40 L34 86 L76 86 Z" fill={k('#5DA0FF')} />
        <Path d="M70 40 L130 40 L124 86 L76 86 Z" fill={k('#B5D6FF')} />
        <Path d="M130 40 L166 86 L124 86 Z" fill={k('#7FB5FF')} />
        <Path d="M34 86 L76 86 L100 180 Z" fill={k('#2F6FE0')} />
        <Path d="M76 86 L124 86 L100 180 Z" fill={k('#4C8CFF')} />
        <Path d="M124 86 L166 86 L100 180 Z" fill={k('#1F55C2')} />
      </G>
      <Path d="M80 48 L98 48 L88 80 Z" fill="#FFFFFF" fillOpacity={0.38} />
      <Path d="M100 8 L107 19 L100 30 L93 19 Z" fill={k('#E6F1FF')} stroke="#FFFFFF" strokeWidth={1} strokeLinejoin="round" />
      <Path d={spark(28, 30, 8)} fill={k('#FFFFFF')} />
      <Path d={spark(174, 38, 10)} fill={k('#FFFFFF')} />
      <Path d={spark(170, 152, 6)} fill={k('#BFD9FF')} />
    </>
  );
}

function Master({ k, u }: P) {
  const l = k('#F6D9FF');
  return (
    <>
      <Defs>
        <RG id={`${u}glow`} k={k} stops={[[0, '#C45BFF', 0.75], [1, '#C45BFF', 0]]} />
        <LG id={`${u}wing`} k={k} stops={[[0, '#F6D9FF'], [0.5, '#C45BFF'], [1, '#5A1AA8']]} />
        <LG id={`${u}body`} k={k} stops={[[0, '#F2CCFF'], [0.5, '#B24BFF'], [1, '#4A178F']]} />
        <RG id={`${u}orb`} k={k} stops={[[0, '#FFFFFF'], [0.45, '#E9B3FF'], [1, '#8A2BE2']]} />
      </Defs>
      <Circle cx="100" cy="100" r="100" fill={`url(#${u}glow)`} />
      <Circle cx="100" cy="104" r="90" fill="none" stroke={k('#E9B3FF')} strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="2 6" strokeLinecap="round" />
      <Mirror>
        <Path d="M52 80 C30 76 10 58 3 22 C18 38 34 44 54 46 Z" fill={`url(#${u}wing)`} stroke={l} strokeWidth={1.4} strokeLinejoin="round" />
        <Path d="M52 92 C28 92 8 80 2 52 C16 62 32 66 54 64 Z" fill={`url(#${u}wing)`} stroke={l} strokeWidth={1.4} strokeLinejoin="round" />
        <Path d="M52 104 C32 108 14 100 6 80 C18 88 34 90 54 84 Z" fill={`url(#${u}wing)`} stroke={l} strokeWidth={1.4} strokeLinejoin="round" />
        <Path d="M52 116 C38 122 24 120 14 108 C26 110 38 108 54 100 Z" fill={`url(#${u}wing)`} stroke={l} strokeWidth={1.4} strokeLinejoin="round" />
      </Mirror>
      <Path d="M100 12 L111 32 L132 24 L140 46 L160 50 L156 112 Q156 150 100 186 Q44 150 44 112 L40 50 L60 46 L68 24 L89 32 Z" fill={`url(#${u}body)`} stroke={l} strokeWidth={3.5} strokeLinejoin="round" />
      <Path d="M100 42 L146 54 L146 110 Q146 142 100 168 Q54 142 54 110 L54 54 Z" fill={k('#17042E')} fillOpacity={0.62} stroke={k('#E9B3FF')} strokeOpacity={0.7} strokeWidth={2} strokeLinejoin="round" />
      <Circle cx="100" cy="106" r="37" fill="none" stroke={l} strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="3 5" />
      <Circle cx="100" cy="106" r="28" fill={`url(#${u}orb)`} stroke={l} strokeWidth={2} />
      <Ellipse cx="100" cy="106" rx="46" ry="14" transform="rotate(-24 100 106)" fill="none" stroke={l} strokeWidth={2} strokeOpacity={0.85} />
      <Path d={spark(100, 106, 12)} fill="#FFFFFF" />
      <Circle cx="100" cy="30" r="4" fill="#FFFFFF" />
      <Path d={spark(18, 126, 8)} fill={l} />
      <Path d={spark(184, 120, 7)} fill={l} />
      <Circle cx="24" cy="168" r="2.5" fill={k('#E9B3FF')} />
      <Circle cx="176" cy="170" r="2.5" fill={k('#E9B3FF')} />
      <Circle cx="38" cy="186" r="1.8" fill="#FFFFFF" />
      <Circle cx="164" cy="188" r="1.8" fill="#FFFFFF" />
    </>
  );
}

function Champion({ k, u }: P) {
  const rim = k('#FFF6C4');
  return (
    <>
      <Defs>
        <RG id={`${u}glow`} k={k} stops={[[0, '#FFD66B', 0.7], [0.55, '#FF4A6E', 0.28], [1, '#FF4A6E', 0]]} />
        <LinearGradient id={`${u}ray`} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={k('#FFE9A0')} stopOpacity={0.7} />
          <Stop offset="1" stopColor={k('#FFE9A0')} stopOpacity={0} />
        </LinearGradient>
        <LG id={`${u}wing`} k={k} stops={[[0, '#FFF3B0'], [0.5, '#FFB547'], [1, '#E0345F']]} />
        <LG id={`${u}body`} k={k} stops={[[0, '#FF8FA8'], [0.5, '#E0214F'], [1, '#5E0B2A']]} />
        <LG id={`${u}gold`} k={k} v stops={[[0, '#FFF6C4'], [0.55, '#FFC233'], [1, '#B9740B']]} />
        <LG id={`${u}prism`} k={k} stops={[[0, '#FFFFFF'], [0.35, '#FFE08A'], [0.7, '#7FEBFF'], [1, '#FF8FD0']]} />
      </Defs>
      <Circle cx="100" cy="100" r="100" fill={`url(#${u}glow)`} />
      <G>
        {Array.from({ length: 12 }, (_, i) => (
          <Path key={i} d="M100 100 L95.5 6 L104.5 6 Z" fill={`url(#${u}ray)`} transform={`rotate(${i * 30} 100 100)`} />
        ))}
      </G>
      <Circle cx="100" cy="100" r="95" fill="none" stroke={`url(#${u}gold)`} strokeWidth={2.5} strokeDasharray="1 7" strokeLinecap="round" />
      <Mirror>
        <Path d="M50 70 C26 64 8 46 2 14 C16 28 32 34 54 36 Z" fill={`url(#${u}wing)`} stroke={rim} strokeWidth={1.3} strokeLinejoin="round" />
        <Path d="M50 84 C24 82 6 68 1 40 C14 50 30 54 54 52 Z" fill={`url(#${u}wing)`} stroke={rim} strokeWidth={1.3} strokeLinejoin="round" />
        <Path d="M50 98 C26 100 8 90 2 68 C16 76 32 78 54 72 Z" fill={`url(#${u}wing)`} stroke={rim} strokeWidth={1.3} strokeLinejoin="round" />
        <Path d="M50 112 C30 118 14 112 6 96 C18 102 34 100 54 90 Z" fill={`url(#${u}wing)`} stroke={rim} strokeWidth={1.3} strokeLinejoin="round" />
        <Path d="M52 126 C38 134 24 132 14 122 C26 122 38 118 54 108 Z" fill={`url(#${u}wing)`} stroke={rim} strokeWidth={1.3} strokeLinejoin="round" />
      </Mirror>
      <Path d="M100 50 L152 62 L158 110 Q152 152 100 186 Q48 152 42 110 L48 62 Z" fill={`url(#${u}body)`} stroke={`url(#${u}gold)`} strokeWidth={4.5} strokeLinejoin="round" />
      <Path d="M100 66 L142 75 L146 110 Q141 142 100 168 Q59 142 54 110 L58 75 Z" fill={k('#2A0614')} fillOpacity={0.5} stroke={k('#FFE9A0')} strokeOpacity={0.7} strokeWidth={2} strokeLinejoin="round" />
      <Polygon points="100,84 107.6,103.5 128.5,104.7 112.4,118 117.6,138.3 100,127 82.4,138.3 87.6,118 71.5,104.7 92.4,103.5" fill={`url(#${u}prism)`} stroke={rim} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M64 52 L58 20 L80 36 L100 8 L120 36 L142 20 L136 52 Z" fill={`url(#${u}gold)`} stroke={rim} strokeWidth={2} strokeLinejoin="round" />
      <Rect x="64" y="52" width="72" height="11" rx="3" fill={`url(#${u}gold)`} stroke={rim} strokeWidth={2} />
      <Circle cx="58" cy="20" r="4.5" fill="#FFFFFF" stroke={k('#FFC233')} strokeWidth={1.5} />
      <Circle cx="100" cy="8" r="5" fill="#FFFFFF" stroke={k('#FFC233')} strokeWidth={1.5} />
      <Circle cx="142" cy="20" r="4.5" fill="#FFFFFF" stroke={k('#FFC233')} strokeWidth={1.5} />
      <Circle cx="100" cy="42" r="5" fill={k('#FF3D6E')} stroke={rim} strokeWidth={1.5} />
      <Path d={spark(15, 34, 10)} fill={rim} />
      <Path d={spark(182, 34, 9)} fill={rim} />
      <Path d={spark(178, 150, 7)} fill={k('#7FEBFF')} />
      <Path d={spark(22, 152, 6)} fill={k('#FF8FD0')} />
      <Circle cx="14" cy="176" r="2.2" fill={k('#FFE9A0')} />
      <Circle cx="188" cy="178" r="2.2" fill={k('#FFE9A0')} />
      <Circle cx="100" cy="197" r="2" fill="#FFFFFF" />
    </>
  );
}

const BY_RANK: Record<RankKey, React.ComponentType<P>> = {
  bronze: Bronze, silber: Silber, gold: Gold, platin: Platin, diamant: Diamant, master: Master, champion: Champion,
};

interface Props {
  rank: RankKey;
  size?: number;
  locked?: boolean;
}

/** Rang-Emblem als SVG (viewBox 200 × 200). Jeder Rang hat eine eigene Form. */
export function Emblem({ rank, size = 100, locked = false }: Props) {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '');
  const Shape = BY_RANK[rank];
  const k: K = locked ? gray : (c) => c;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
      <Shape k={k} u={u} />
    </Svg>
  );
}
