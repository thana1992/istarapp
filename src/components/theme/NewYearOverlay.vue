<template>
  <!-- ปีใหม่ — champagne-gold fireworks bursting over a midnight sky + drifting confetti.
       Decorative only (pointer-events:none). transform/opacity animations only. -->
  <div class="ny-overlay" aria-hidden="true">
    <svg v-for="(f, i) in fireworks" :key="'nyf-' + i" class="ny-fw" :style="fwStyle(f)" viewBox="-50 -50 100 100">
      <g class="ny-burst">
        <g v-for="r in 12" :key="r" :transform="'rotate(' + (r * 30) + ')'">
          <line x1="0" y1="-8" x2="0" y2="-40" :stroke="f.color" stroke-width="2.4" stroke-linecap="round" />
          <circle cx="0" cy="-44" r="3" :fill="f.color" />
        </g>
      </g>
    </svg>
    <span v-for="(c, i) in confetti" :key="'nyc-' + i" class="ny-conf" :style="confStyle(c)"></span>
  </div>
</template>

<script>
import { rand, pick } from '@/utils/random';
const SPARK = ['#f0d479', '#ffe9a8', '#e88fb5', '#8fb4f0', '#c8a8f0'];

export default {
  name: 'NewYearOverlay',
  props: { burstCount: { type: Number, default: 5 }, confettiCount: { type: Number, default: 16 } },
  data() {
    return {
      fireworks: Array.from({ length: this.burstCount }, () => ({
        left: rand(8, 90), top: rand(8, 55), size: rand(80, 150),
        color: pick(SPARK), dur: rand(2.4, 3.8), delay: rand(0, 5),
      })),
      confetti: Array.from({ length: this.confettiCount }, () => ({
        left: rand(0, 100), w: rand(5, 10), color: pick(SPARK),
        dur: rand(7, 14), delay: rand(-14, 0), spin: Math.random() < 0.5 ? -1 : 1,
      })),
    };
  },
  methods: {
    fwStyle(f) { return { left: f.left + '%', top: f.top + '%', width: f.size + 'px', height: f.size + 'px', animationDuration: f.dur + 's', animationDelay: f.delay + 's' }; },
    confStyle(c) { return { left: c.left + '%', width: c.w + 'px', height: c.w * 1.6 + 'px', background: c.color, '--ny-spin': c.spin, animationDuration: c.dur + 's', animationDelay: c.delay + 's' }; },
  },
};
</script>

<style scoped>
.ny-overlay { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }
.ny-fw { position: absolute; transform: translate(-50%, -50%); animation: ny-fade ease-out infinite; }
.ny-burst { transform-box: view-box; transform-origin: center; animation: ny-burst ease-out infinite; }
.ny-fw, .ny-burst { animation-duration: inherit; animation-delay: inherit; }
.ny-conf { position: absolute; top: -6%; border-radius: 2px; opacity: .85; animation: ny-fall linear infinite; }

@keyframes ny-burst { 0% { transform: scale(.12); } 70% { transform: scale(1); } 100% { transform: scale(1.08); } }
@keyframes ny-fade { 0%, 100% { opacity: 0; } 12% { opacity: 1; } 64% { opacity: .55; } }
@keyframes ny-fall {
  0% { transform: translateY(-10vh) rotate(0deg); }
  100% { transform: translateY(112vh) rotate(calc(var(--ny-spin) * 720deg)); }
}
@media (prefers-reduced-motion: reduce) { .ny-fw, .ny-burst, .ny-conf { animation: none; } .ny-fw { opacity: .6; } .ny-conf { display: none; } }
</style>
