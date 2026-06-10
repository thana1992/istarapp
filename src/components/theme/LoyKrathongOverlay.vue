<template>
  <!-- ลอยกระทง — full moon, rising sky-lanterns (โคมลอย) of varied colours/shapes,
       and krathong of varied flowers drifting on a line-art water. Decorative only.
       Gradient ids are namespaced per-instance (uid) so two overlays on one page
       (login hero + mobile form) never collide — a collision made the lanterns
       lose their colour when the first instance was display:none. -->
  <div class="lk-overlay" aria-hidden="true">
    <!-- shared gradient defs (per-instance ids) -->
    <svg class="lk-defs" width="0" height="0" aria-hidden="true">
      <defs>
        <radialGradient :id="uid + 'Glow'" cx="50%" cy="58%" r="55%">
          <stop offset="0%" stop-color="#ffd27a" stop-opacity=".6" />
          <stop offset="55%" stop-color="#f7a23c" stop-opacity=".16" />
          <stop offset="100%" stop-color="#f7a23c" stop-opacity="0" />
        </radialGradient>
        <radialGradient :id="uid + 'Flame'" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stop-color="#fff6cf" />
          <stop offset="55%" stop-color="#ffc24d" />
          <stop offset="100%" stop-color="#ff8a3c" stop-opacity=".15" />
        </radialGradient>
        <radialGradient :id="uid + 'KGlow'" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffd27a" stop-opacity=".5" />
          <stop offset="100%" stop-color="#ffd27a" stop-opacity="0" />
        </radialGradient>
        <radialGradient :id="uid + 'Warm'" cx="50%" cy="74%" r="72%">
          <stop offset="0%" stop-color="#ffeaa8" /><stop offset="42%" stop-color="#ffba51" /><stop offset="100%" stop-color="#ef8a2b" />
        </radialGradient>
        <radialGradient :id="uid + 'Rose'" cx="50%" cy="74%" r="72%">
          <stop offset="0%" stop-color="#ffe1d4" /><stop offset="42%" stop-color="#ff9b88" /><stop offset="100%" stop-color="#e85d6e" />
        </radialGradient>
        <radialGradient :id="uid + 'Gold'" cx="50%" cy="74%" r="72%">
          <stop offset="0%" stop-color="#fff2b0" /><stop offset="42%" stop-color="#ffd451" /><stop offset="100%" stop-color="#e0a318" />
        </radialGradient>
        <radialGradient :id="uid + 'Mango'" cx="50%" cy="74%" r="72%">
          <stop offset="0%" stop-color="#ffd9a0" /><stop offset="42%" stop-color="#ff9d3c" /><stop offset="100%" stop-color="#e8631f" />
        </radialGradient>
      </defs>
    </svg>

    <!-- full moon -->
    <div class="lk-moon"></div>

    <!-- faint stars -->
    <span v-for="(s, i) in stars" :key="'lks-' + i" class="lk-star" :style="starStyle(s)"></span>

    <!-- rising sky-lanterns — varied shape / colour / size; ~half swing their bottom, fade in mid-screen -->
    <span v-for="(l, i) in lanterns" :key="'lkl-' + i" class="lk-rise" :style="riseStyle(l)">
      <span class="lk-drift" :style="driftStyle(l)">
        <span class="lk-swingwrap" :class="{ swing: l.sway }" :style="swingStyle(l)">
          <svg class="lk-lantern" viewBox="0 0 48 66" :style="{ width: l.size + 'px', transform: 'scaleY(' + l.sy + ')' }">
            <ellipse cx="24" cy="32" rx="22" ry="30" :fill="glowFill" />
            <path :d="l.s.d" :fill="l.fill" />
            <ellipse cx="24" :cy="l.s.glowCy" rx="9" ry="11" :fill="glowFill" opacity=".5" />
            <path :d="l.s.ribs" stroke="rgba(150,70,16,.16)" stroke-width=".8" fill="none" />
            <ellipse cx="24" cy="6.5" rx="3" ry="1.4" fill="#9c5018" />
            <ellipse cx="24" :cy="l.s.botY" rx="5.5" ry="1.9" fill="#8a4a18" />
            <ellipse cx="24" :cy="l.s.flameY" rx="2.2" ry="3.6" :fill="flameFill" />
          </svg>
        </span>
      </span>
    </span>

    <!-- line-art water surface -->
    <div class="lk-water">
      <svg viewBox="0 0 240 48" preserveAspectRatio="none">
        <g v-for="(w, i) in waves" :key="'lkw-' + i" class="lk-wave" :class="{ rev: w.rev }"
          :style="{ animationDuration: w.dur + 's' }">
          <path :d="wavePath(w.y, w.amp)" :style="{ stroke: 'rgba(255,213,150,' + w.op + ')' }" />
        </g>
      </svg>

      <!-- floating krathong — varied flowers; drift (slow X) decoupled from bob/rock (faster Y+rotate) -->
      <span v-for="(k, i) in krathongs" :key="'lkk-' + i" class="lk-krathong" :style="kDriftStyle(k)">
        <span class="lk-kbob" :style="{ animationDuration: k.bobDur + 's' }">
          <svg class="lk-krathong-svg" viewBox="0 0 76 50" :style="{ width: k.size + 'px' }">
            <ellipse cx="38" cy="44" rx="30" ry="5.5" :fill="kglowFill" />

            <!-- กระทงใบตอง -->
            <g v-if="k.type === 'leaf'">
              <ellipse cx="38" cy="36" rx="30" ry="9" fill="#2f8b54" />
              <ellipse cx="38" cy="35" rx="26" ry="7" fill="#3aa564" />
              <path d="M10 35 L15 24 L20 34 L25 23 L30 34 L35 22 L40 34 L45 23 L50 34 L55 24 L60 35 Z" fill="#2e8b57" />
              <path d="M10 35 L15 24 L20 34 L25 23 L30 34 L35 22 L40 34 L45 23 L50 34 L55 24 L60 35" fill="none" stroke="#256e45" stroke-width=".7" />
              <line x1="31" y1="27" x2="28" y2="10" stroke="#7a4a2a" stroke-width=".8" />
              <line x1="45" y1="27" x2="48" y2="10" stroke="#7a4a2a" stroke-width=".8" />
              <circle cx="28" cy="10" r="1" fill="#e0402a" /><circle cx="48" cy="10" r="1" fill="#e0402a" />
              <circle cx="29" cy="30" r="3.4" :fill="k.fl.mari" /><circle cx="47" cy="30" r="3.4" :fill="k.fl.mari" />
              <path d="M38 32 Q31 30 28 33 Q34 35 38 33 Q42 35 48 33 Q45 30 38 32 Z" :fill="k.fl.po" />
              <ellipse cx="38" cy="31" rx="5.4" ry="3.4" :fill="k.fl.pi" />
              <circle cx="38" cy="31" r="1.7" :fill="k.fl.ctr" />
            </g>

            <!-- กระทงขนมปัง -->
            <g v-else-if="k.type === 'bread'">
              <ellipse cx="38" cy="38" rx="29" ry="10" fill="#b9783c" />
              <ellipse cx="38" cy="35" rx="29" ry="9" fill="#d9a05a" />
              <ellipse cx="38" cy="34" rx="24" ry="6.5" fill="#e8be7e" />
              <circle cx="26" cy="34" r="1" fill="#a86a32" /><circle cx="50" cy="35" r="1" fill="#a86a32" /><circle cx="38" cy="37" r="1" fill="#a86a32" />
              <line x1="31" y1="27" x2="29" y2="11" stroke="#7a4a2a" stroke-width=".8" />
              <line x1="45" y1="27" x2="47" y2="11" stroke="#7a4a2a" stroke-width=".8" />
              <circle cx="29" cy="11" r="1" fill="#e0402a" /><circle cx="47" cy="11" r="1" fill="#e0402a" />
              <circle cx="30" cy="32" r="3" :fill="k.fl.mari" /><circle cx="46" cy="32" r="3" :fill="k.fl.mari" />
              <ellipse cx="38" cy="32" rx="4.6" ry="3" :fill="k.fl.pi" />
              <circle cx="38" cy="32" r="1.5" :fill="k.fl.ctr" />
            </g>

            <!-- กระทงดอกบัว -->
            <g v-else-if="k.type === 'lotus'">
              <ellipse cx="38" cy="38" rx="27" ry="7.5" fill="#2e8b57" />
              <g :fill="k.fl.po">
                <path d="M38 37 C30 35 22 31 16 33 C22 36 30 37 38 37 Z" />
                <path d="M38 37 C46 35 54 31 60 33 C54 36 46 37 38 37 Z" />
                <path d="M38 36 C32 32 26 27 22 28 C26 33 32 36 38 36 Z" />
                <path d="M38 36 C44 32 50 27 54 28 C50 33 44 36 38 36 Z" />
              </g>
              <g :fill="k.fl.pi">
                <path d="M38 35 C34 31 30 27 30 25 C34 28 38 31 38 35 Z" />
                <path d="M38 35 C42 31 46 27 46 25 C42 28 38 31 38 35 Z" />
              </g>
              <circle cx="38" cy="31" r="2" :fill="k.fl.ctr" />
            </g>

            <!-- กระทงหยวกกล้วย -->
            <g v-else>
              <ellipse cx="38" cy="37" rx="29" ry="9.5" fill="#cbb98e" />
              <ellipse cx="38" cy="36" rx="25" ry="7.5" fill="#e6dcc0" />
              <ellipse cx="38" cy="35.5" rx="18" ry="5.5" fill="#f0e9d4" stroke="#d3c6a0" stroke-width=".5" />
              <ellipse cx="38" cy="35.5" rx="10" ry="3" fill="none" stroke="#d3c6a0" stroke-width=".5" />
              <circle cx="30" cy="32" r="2.6" :fill="k.fl.mari" /><circle cx="46" cy="32" r="2.6" :fill="k.fl.mari" />
              <ellipse cx="38" cy="32" rx="4.4" ry="2.8" :fill="k.fl.pi" />
              <circle cx="38" cy="32" r="1.4" :fill="k.fl.ctr" />
            </g>

            <!-- candle + flame (shared) -->
            <rect x="36.8" y="15" width="2.4" height="11" rx="1" fill="#fff0d2" />
            <ellipse cx="38" cy="12.5" rx="2.3" ry="4" :fill="flameFill" />
          </svg>
        </span>
      </span>
    </div>
  </div>
</template>

<script>
import { rand, pick } from '@/utils/random';

const VARIANTS = ['Warm', 'Rose', 'Gold', 'Mango'];

// distinct sky-lantern (โคมลอย) silhouettes — body path + per-shape anchor points
// (glowCy = inner glow centre, botY = bottom ring, flameY = flame, ribs = light lines)
const LANTERN_SHAPES = [
  { // 0 — balloon / round onion
    d: 'M24 56 C5 49 2 24 13 11 C17 4 31 4 35 11 C46 24 43 49 24 56 Z',
    glowCy: 42, botY: 54, flameY: 58,
    ribs: 'M24 8 C20 26 20 42 22 52 M14 11 C10 28 11 44 17 52 M34 11 C38 28 37 44 31 52',
  },
  { // 1 — tapered teardrop (narrow, elongated)
    d: 'M24 59 C13 53 13 22 18 9 C20 4 28 4 30 9 C35 22 35 53 24 59 Z',
    glowCy: 47, botY: 57, flameY: 61,
    ribs: 'M24 9 C21 27 21 45 23 56 M19 11 C16 29 16 47 20 56 M29 11 C32 29 32 47 28 56',
  },
  { // 2 — tall cylinder (straight sides, rounded shoulders)
    d: 'M15 53 C12 49 12 16 15 10 C17 5 31 5 33 10 C36 16 36 49 33 53 C30 56 18 56 15 53 Z',
    glowCy: 40, botY: 54, flameY: 58,
    ribs: 'M19 9 L18 52 M24 8 L24 53 M29 9 L30 52',
  },
  { // 3 — diamond-faceted khom (angular)
    d: 'M24 58 L8 33 L16 12 L24 5 L32 12 L40 33 Z',
    glowCy: 36, botY: 55, flameY: 59,
    ribs: 'M24 6 L24 55 M16 13 L21 50 M32 13 L27 50',
  },
];
const KRATHONG_TYPES = ['leaf', 'bread', 'lotus', 'trunk']; // ใบตอง / ขนมปัง / ดอกบัว / หยวกกล้วย
const KRATHONG_FLOWERS = [
  { mari: '#f6a623', po: '#f4b8d0', pi: '#fff1f7', ctr: '#f6c84c' }, // lotus pink
  { mari: '#f4a01e', po: '#ffe08a', pi: '#fffdf0', ctr: '#f2b705' }, // chrysanthemum yellow
  { mari: '#f6a623', po: '#d8b8f0', pi: '#fbf5ff', ctr: '#c9a0ec' }, // orchid purple
  { mari: '#ef7e1f', po: '#ffc06b', pi: '#ffe7bd', ctr: '#e8631f' }, // all-marigold
];

export default {
  name: 'LoyKrathongOverlay',
  props: {
    lanternCount: { type: Number, default: 5 },
    starCount: { type: Number, default: 5 },
    krathongCount: { type: Number, default: 5 },
  },
  data() {
    const uid = 'lk' + Math.random().toString(36).slice(2, 8);
    return {
      uid,
      lanterns: Array.from({ length: this.lanternCount }, () => {
        const sway = Math.random() < 0.5;   // half swing their bottom ("แกว่งตูด"), half rise straight
        return {
          left: rand(2, 92),
          size: rand(28, 46),
          sy: rand(0.9, 1.18),
          s: pick(LANTERN_SHAPES),          // distinct silhouette (balloon / teardrop / cylinder / khom)
          fill: 'url(#' + uid + pick(VARIANTS) + ')',
          riseDur: rand(22, 36),
          riseDelay: rand(-36, 0),
          driftX: sway ? rand(6, 12) : rand(10, 26),  // swingers drift less (the swing reads as the motion)
          driftDur: rand(5, 8),
          sway,
          swingDur: rand(2.6, 4.2),
          swingDelay: rand(-4, 0),
        };
      }),
      stars: Array.from({ length: this.starCount }, () => ({
        left: rand(3, 96), top: rand(4, 40), size: rand(2, 4),
        opacity: rand(0.5, 0.9), dur: rand(2.6, 4.6), delay: rand(0, 4),
      })),
      krathongs: Array.from({ length: this.krathongCount }, (_, i) => {
        const depth = rand(0, 1);   // 0 = near (low on water, big), 1 = far (high, small, hazy)
        return {
          left: this.krathongCount > 1 ? 6 + (i * 86) / (this.krathongCount - 1) + rand(-4, 4) : rand(30, 50),
          bottom: 6 + depth * 62,                 // staggered height across the water band
          size: 88 - depth * 34 + rand(-4, 4),    // perspective: nearer = bigger
          opacity: 1 - depth * 0.3,               // farther = hazier
          type: pick(KRATHONG_TYPES),             // ใบตอง / ขนมปัง / ดอกบัว / หยวกกล้วย
          fl: pick(KRATHONG_FLOWERS),
          driftX: rand(12, 24),
          driftDur: rand(9, 13),
          bobDur: rand(3, 4.4),
        };
      }),
      waves: [
        { y: 14, amp: 3.2, op: 0.5, dur: 11, rev: false },
        { y: 22, amp: 4.2, op: 0.42, dur: 8, rev: true },
        { y: 31, amp: 3.4, op: 0.32, dur: 13, rev: false },
        { y: 39, amp: 4.6, op: 0.24, dur: 9, rev: true },
      ],
    };
  },
  computed: {
    glowFill() { return 'url(#' + this.uid + 'Glow)'; },
    flameFill() { return 'url(#' + this.uid + 'Flame)'; },
    kglowFill() { return 'url(#' + this.uid + 'KGlow)'; },
  },
  methods: {
    riseStyle(l) { return { left: l.left + '%', animationDuration: l.riseDur + 's', animationDelay: l.riseDelay + 's' }; },
    driftStyle(l) { return { '--lk-dx': l.driftX + 'px', animationDuration: l.driftDur + 's' }; },
    swingStyle(l) { return l.sway ? { animationDuration: l.swingDur + 's', animationDelay: l.swingDelay + 's' } : {}; },
    starStyle(s) {
      return {
        left: s.left + '%', top: s.top + '%', width: s.size + 'px', height: s.size + 'px',
        '--lk-o': s.opacity, animationDuration: s.dur + 's', animationDelay: s.delay + 's',
      };
    },
    kDriftStyle(k) {
      return {
        left: k.left + '%', bottom: k.bottom + '%', opacity: k.opacity,
        '--lk-kx': k.driftX + 'px', animationDuration: k.driftDur + 's',
      };
    },
    wavePath(y, amp) {
      let d = `M-40 ${y}`;
      let up = true;
      for (let x = -40; x < 280; x += 20) { d += ` q 10 ${up ? -amp : amp} 20 0`; up = !up; }
      return d;
    },
  },
};
</script>

<style scoped>
.lk-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;   /* behind page content, above the .main gradient (see App.vue .main) */
}
.lk-defs { position: absolute; width: 0; height: 0; }

/* ---- full moon ---- */
.lk-moon {
  position: absolute;
  top: 5%;
  right: 7%;
  width: clamp(120px, 16vw, 208px);
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 62% 36%, rgba(206,170,112,.45) 0 7%, transparent 8%),
    radial-gradient(circle at 44% 60%, rgba(206,170,112,.4) 0 5%, transparent 6%),
    radial-gradient(circle at 70% 67%, rgba(206,170,112,.32) 0 4%, transparent 5%),
    radial-gradient(circle at 40% 34%, #fff6e3 0%, #ffe7b8 52%, #f3cd88 100%);
  box-shadow: 0 0 46px 8px rgba(255,210,140,.38), 0 0 100px 24px rgba(255,190,120,.2);
}
.lk-moon::after {
  content: '';
  position: absolute;
  inset: -20%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,214,150,.34), transparent 62%);
  animation: lk-halo 7s ease-in-out infinite;
}

/* ---- stars ---- */
.lk-star { position: absolute; border-radius: 50%; background: #fff4d6; opacity: 0; animation: lk-star-tw ease-in-out infinite; }

/* ---- rising sky-lanterns ---- */
.lk-rise { position: absolute; bottom: 0; animation: lk-rise linear infinite; }
.lk-drift { display: inline-block; animation: lk-drift ease-in-out infinite alternate; }
/* pendulum: pivots near the top so the bottom swings ("แกว่งตูด"); only on .swing lanterns */
.lk-swingwrap { display: inline-block; transform-origin: 50% 9%; }
.lk-swingwrap.swing { animation: lk-swing ease-in-out infinite alternate; }
.lk-lantern { display: block; transform-origin: center bottom; }

/* ---- line-art water ---- */
.lk-water { position: absolute; left: 0; right: 0; bottom: 0; height: clamp(104px, 21%, 196px); }
.lk-water > svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.lk-wave { animation-name: lk-wave-l; animation-timing-function: linear; animation-iteration-count: infinite; }
.lk-wave.rev { animation-name: lk-wave-r; }
.lk-wave path { fill: none; stroke-width: 1.5; stroke-linecap: round; }

/* ---- floating krathong ---- */
.lk-krathong { position: absolute; animation: lk-kdrift ease-in-out infinite alternate; }   /* bottom set per-krathong (staggered) */
.lk-kbob { display: block; animation: lk-kbob ease-in-out infinite; }
.lk-krathong-svg { display: block; }

/* lanterns fade in around mid-screen and rise — they don't emerge from the water */
@keyframes lk-rise {
  0%   { transform: translateY(-38vh); opacity: 0; }
  16%  { opacity: .95; }
  78%  { opacity: .95; }
  100% { transform: translateY(-120vh); opacity: 0; }
}
@keyframes lk-drift { from { transform: translateX(calc(var(--lk-dx) * -1)); } to { transform: translateX(var(--lk-dx)); } }
@keyframes lk-swing { from { transform: rotate(-7.5deg); } to { transform: rotate(7.5deg); } }
@keyframes lk-wave-l { from { transform: translateX(0); } to { transform: translateX(-40px); } }
@keyframes lk-wave-r { from { transform: translateX(-40px); } to { transform: translateX(0); } }
@keyframes lk-kdrift { from { transform: translateX(calc(var(--lk-kx) * -1)); } to { transform: translateX(var(--lk-kx)); } }
@keyframes lk-kbob { 0%, 100% { transform: translateY(0) rotate(-2.5deg); } 50% { transform: translateY(-4px) rotate(2.5deg); } }
@keyframes lk-star-tw { 0%, 100% { opacity: 0; } 50% { opacity: var(--lk-o, .8); } }
@keyframes lk-halo { 0%, 100% { opacity: .5; } 50% { opacity: .9; } }

@media (prefers-reduced-motion: reduce) {
  .lk-rise, .lk-drift, .lk-swingwrap, .lk-krathong, .lk-kbob, .lk-star, .lk-moon::after, .lk-wave { animation: none; }
  .lk-rise { opacity: .95; transform: translateY(-45vh); }
  .lk-star { opacity: var(--lk-o, .6); }
}
</style>
