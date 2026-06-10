<template>
  <!-- วันพ่อ — gently falling yellow canna (ดอกพุทธรักษา) blooms + soft gold sparkles.
       Calm and respectful. Decorative only. transform/opacity animations only. -->
  <div class="fd-overlay" aria-hidden="true">
    <span v-for="(f, i) in flowers" :key="'fdf-' + i" class="fd-fall" :style="fallStyle(f)">
      <span class="fd-sway" :style="swayStyle(f)">
        <svg class="fd-glyph" viewBox="0 0 44 44" :style="glyphStyle(f)">
          <g>
            <ellipse cx="22" cy="11" rx="6" ry="10.5" :fill="f.color" />
            <ellipse cx="22" cy="11" rx="6" ry="10.5" :fill="f.color" transform="rotate(72 22 22)" />
            <ellipse cx="22" cy="11" rx="6" ry="10.5" :fill="f.color" transform="rotate(144 22 22)" />
            <ellipse cx="22" cy="11" rx="6" ry="10.5" :fill="f.color" transform="rotate(216 22 22)" />
            <ellipse cx="22" cy="11" rx="6" ry="10.5" :fill="f.color" transform="rotate(288 22 22)" />
          </g>
          <circle cx="22" cy="22" r="4.4" :fill="f.core" />
        </svg>
      </span>
    </span>
    <span v-for="(s, i) in sparkles" :key="'fds-' + i" class="fd-spark mdi mdi-star-four-points" :style="sparkStyle(s)"></span>
  </div>
</template>

<script>
import { rand, pick } from '@/utils/random';
const PETAL = ['#f6c731', '#ffd95a', '#f3b81f', '#ffe27a'];
const CORE = ['#e07c1a', '#d9651a', '#f29d2e'];

export default {
  name: 'FathersDayOverlay',
  props: { flowerCount: { type: Number, default: 14 }, sparkleCount: { type: Number, default: 9 } },
  data() {
    return {
      flowers: Array.from({ length: this.flowerCount }, () => ({
        left: rand(0, 100), size: rand(20, 40), opacity: rand(0.7, 0.96),
        color: pick(PETAL), core: pick(CORE),
        fallDur: rand(12, 21), fallDelay: rand(-21, 0), swayDur: rand(3, 5.5), swayX: rand(12, 28), spin: Math.random() < 0.5 ? -1 : 1,
      })),
      sparkles: Array.from({ length: this.sparkleCount }, () => ({
        left: rand(2, 98), top: rand(4, 92), size: rand(9, 16), dur: rand(2.6, 4.6), delay: rand(0, 5), opacity: rand(0.5, 0.9),
      })),
    };
  },
  methods: {
    fallStyle(f) { return { left: f.left + '%', animationDuration: f.fallDur + 's', animationDelay: f.fallDelay + 's' }; },
    swayStyle(f) { return { '--fd-sway-x': f.swayX + 'px', '--fd-spin': f.spin, animationDuration: f.swayDur + 's' }; },
    glyphStyle(f) { return { width: f.size + 'px', height: f.size + 'px', opacity: f.opacity }; },
    sparkStyle(s) { return { left: s.left + '%', top: s.top + '%', fontSize: s.size + 'px', '--fd-spark-o': s.opacity, animationDuration: s.dur + 's', animationDelay: s.delay + 's' }; },
  },
};
</script>

<style scoped>
.fd-overlay { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }
.fd-fall { position: absolute; top: 0; animation: fd-drop linear infinite; }
.fd-sway { display: inline-block; animation: fd-sway linear(0, 0.5 25%, 0.9 50%, 0.5 75%, 0) infinite alternate; }
.fd-glyph { display: block; filter: drop-shadow(0 3px 4px rgba(150, 110, 20, .18)); }
.fd-spark { position: absolute; color: #f0c233; opacity: 0; filter: drop-shadow(0 0 3px rgba(240, 194, 51, .7)); animation: fd-tw ease-in-out infinite; }

@keyframes fd-drop { from { transform: translateY(-14vh); } to { transform: translateY(114vh); } }
@keyframes fd-sway {
  from { transform: translateX(calc(var(--fd-sway-x) * -1)) rotate(calc(var(--fd-spin) * -38deg)); }
  to   { transform: translateX(var(--fd-sway-x))            rotate(calc(var(--fd-spin) * 38deg)); }
}
@keyframes fd-tw { 0%, 100% { opacity: 0; transform: scale(.5); } 50% { opacity: var(--fd-spark-o, .8); transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { .fd-fall, .fd-sway, .fd-spark { animation: none; } .fd-fall { top: 8%; } .fd-spark { opacity: var(--fd-spark-o, .6); } }
</style>
