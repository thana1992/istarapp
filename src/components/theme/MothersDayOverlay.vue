<template>
  <!-- วันแม่ — drifting white jasmine (ดอกมะลิ, varied: bloom + bud + colours),
       falling pink/white hearts, and soft gold sparkles. Decorative only
       (pointer-events:none). Performance: transform/opacity animations only. -->
  <div class="md-overlay" aria-hidden="true">
    <!-- jasmine + hearts share the same fall + sway motion -->
    <span v-for="(f, i) in petals" :key="'mdp-' + i" class="md-fall" :style="fallStyle(f)">
      <span class="md-sway" :style="swayStyle(f)">
        <!-- jasmine bloom -->
        <svg v-if="f.kind === 'bloom'" class="md-glyph" viewBox="0 0 44 44" :style="glyphStyle(f)">
          <g>
            <ellipse cx="22" cy="11" rx="6.4" ry="10" :fill="f.color" />
            <ellipse cx="22" cy="11" rx="6.4" ry="10" :fill="f.color" transform="rotate(72 22 22)" />
            <ellipse cx="22" cy="11" rx="6.4" ry="10" :fill="f.color" transform="rotate(144 22 22)" />
            <ellipse cx="22" cy="11" rx="6.4" ry="10" :fill="f.color" transform="rotate(216 22 22)" />
            <ellipse cx="22" cy="11" rx="6.4" ry="10" :fill="f.color" transform="rotate(288 22 22)" />
          </g>
          <circle cx="22" cy="22" r="4.3" :fill="f.core" />
        </svg>
        <!-- jasmine bud -->
        <svg v-else-if="f.kind === 'bud'" class="md-glyph" viewBox="0 0 44 44" :style="glyphStyle(f)">
          <path d="M22 5 C14 10 14 25 22 31 C30 25 30 10 22 5 Z" :fill="f.color" />
          <path d="M22 7 C18 14 18 25 22 30" stroke="rgba(180,140,170,.22)" stroke-width="1" fill="none" />
          <ellipse cx="22" cy="31" rx="4.2" ry="3.2" fill="#86bf52" />
          <path d="M22 31 C20 35 20 38 21 40 M22 31 C24 35 24 38 23 40" stroke="#86bf52" stroke-width="1.4" fill="none" />
        </svg>
        <!-- heart -->
        <svg v-else class="md-glyph" viewBox="0 0 24 24" :style="glyphStyle(f)">
          <path d="M12 21.4C12 21.4 2.6 14.3 2.6 7.9 2.6 4.7 5 2.5 7.6 2.5 9.7 2.5 11.2 4 12 5.5 12.8 4 14.3 2.5 16.4 2.5 19 2.5 21.4 4.7 21.4 7.9 21.4 14.3 12 21.4 12 21.4Z"
            :fill="f.color" :stroke="f.outline" stroke-width="1" />
        </svg>
      </span>
    </span>

    <!-- gold sparkles -->
    <span v-for="(s, i) in sparkles" :key="'mds-' + i" class="md-spark mdi mdi-star-four-points" :style="sparkStyle(s)"></span>
  </div>
</template>

<script>
import { rand, pick } from '@/utils/random';

const PETAL_COLORS = ['#ffffff', '#fffaf2', '#fff3f8', '#fef7ff'];
const CORE_COLORS = ['#f1c453', '#f6cf6b', '#eab308'];
const HEART_COLORS = ['#f48fb1', '#ec9bc0', '#f9a8d4', '#ffffff', '#ffffff'];

function makeFaller(kind, extra) {
  return {
    kind,
    left: rand(0, 100),
    size: extra.size,
    opacity: rand(0.6, 0.96),
    fallDur: rand(11, 20),
    fallDelay: rand(-20, 0),
    swayDur: rand(3, 5.5),
    swayX: rand(10, 26),
    spin: Math.random() < 0.5 ? -1 : 1,
    ...extra,
  };
}

export default {
  name: 'MothersDayOverlay',
  props: {
    flowerCount: { type: Number, default: 14 },
    heartCount: { type: Number, default: 7 },
    sparkleCount: { type: Number, default: 9 },
  },
  data() {
    const petals = [];
    for (let i = 0; i < this.flowerCount; i++) {
      // ~70% full bloom, ~30% bud
      const kind = Math.random() < 0.7 ? 'bloom' : 'bud';
      petals.push(makeFaller(kind, {
        size: kind === 'bud' ? rand(16, 30) : rand(20, 40),
        color: pick(PETAL_COLORS),
        core: pick(CORE_COLORS),
      }));
    }
    for (let i = 0; i < this.heartCount; i++) {
      const color = pick(HEART_COLORS);
      petals.push(makeFaller('heart', {
        size: rand(12, 24),
        color,
        outline: color === '#ffffff' ? '#f6a8c8' : 'none',
      }));
    }
    return {
      petals,
      sparkles: Array.from({ length: this.sparkleCount }, () => ({
        left: rand(2, 98), top: rand(4, 92), size: rand(9, 16),
        dur: rand(2.6, 4.6), delay: rand(0, 5), opacity: rand(0.5, 0.9),
      })),
    };
  },
  methods: {
    fallStyle(f) { return { left: f.left + '%', animationDuration: f.fallDur + 's', animationDelay: f.fallDelay + 's' }; },
    swayStyle(f) { return { '--md-sway-x': f.swayX + 'px', '--md-spin': f.spin, animationDuration: f.swayDur + 's' }; },
    glyphStyle(f) { return { width: f.size + 'px', height: f.size + 'px', opacity: f.opacity }; },
    sparkStyle(s) {
      return {
        left: s.left + '%', top: s.top + '%', fontSize: s.size + 'px',
        '--md-spark-o': s.opacity, animationDuration: s.dur + 's', animationDelay: s.delay + 's',
      };
    },
  },
};
</script>

<style scoped>
.md-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;   /* behind page content, above the .main gradient (see App.vue .main) */
}

/* every glyph (jasmine / heart) falls + sways the same way */
.md-fall { position: absolute; top: 0; animation: md-drop linear infinite; }
.md-sway { display: inline-block; animation: md-sway linear(0, 0.5 25%, 0.9 50%, 0.5 75%, 0) infinite alternate; }
.md-glyph { display: block; filter: drop-shadow(0 3px 4px rgba(31, 111, 176, 0.16)); }

/* sparkles */
.md-spark {
  position: absolute;
  color: oklch(83% 0.12 90);
  opacity: 0;
  filter: drop-shadow(0 0 3px oklch(88% 0.1 95 / 0.7));
  animation: md-twinkle ease-in-out infinite;
}

@keyframes md-drop {
  from { transform: translateY(-14vh); }
  to   { transform: translateY(114vh); }
}
@keyframes md-sway {
  from { transform: translateX(calc(var(--md-sway-x) * -1)) rotate(calc(var(--md-spin) * -40deg)); }
  to   { transform: translateX(var(--md-sway-x))            rotate(calc(var(--md-spin) * 40deg)); }
}
@keyframes md-twinkle {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50%      { opacity: var(--md-spark-o, 0.8); transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .md-fall, .md-sway, .md-spark { animation: none; }
  .md-fall { top: 8%; }
  .md-spark { opacity: var(--md-spark-o, 0.6); }
}
</style>
