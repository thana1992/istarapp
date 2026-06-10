<template>
  <!-- คริสต์มาส — falling snow + a string of twinkling lights along the top.
       Decorative only. transform/opacity animations only. -->
  <div class="xm-overlay" aria-hidden="true">
    <div class="xm-lights">
      <span v-for="(l, i) in lights" :key="'xml-' + i" class="xm-light" :style="lightStyle(l)"></span>
    </div>
    <span v-for="(s, i) in snow" :key="'xms-' + i" class="xm-snow" :style="snowStyle(s)"></span>
  </div>
</template>

<script>
import { rand } from '@/utils/random';
const LIGHT = ['#e7382c', '#1f9d57', '#e6b422', '#3b82f6', '#ec4899'];

export default {
  name: 'ChristmasOverlay',
  props: { snowCount: { type: Number, default: 26 }, lightCount: { type: Number, default: 16 } },
  data() {
    return {
      snow: Array.from({ length: this.snowCount }, () => ({
        left: rand(0, 100), size: rand(4, 10), dur: rand(7, 15), delay: rand(-15, 0), sway: rand(10, 30), op: rand(0.5, 0.95),
      })),
      lights: Array.from({ length: this.lightCount }, (_, i) => ({
        color: LIGHT[i % LIGHT.length], dur: rand(1.6, 2.8), delay: rand(0, 2),
      })),
    };
  },
  methods: {
    snowStyle(s) { return { left: s.left + '%', width: s.size + 'px', height: s.size + 'px', opacity: s.op, '--xm-sway': s.sway + 'px', animationDuration: s.dur + 's', animationDelay: s.delay + 's' }; },
    lightStyle(l) { return { '--xm-c': l.color, color: l.color, animationDuration: l.dur + 's', animationDelay: l.delay + 's' }; },
  },
};
</script>

<style scoped>
.xm-overlay { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }
.xm-lights { position: absolute; top: 0; left: -2%; right: -2%; display: flex; justify-content: space-around; padding-top: 6px; }
.xm-light { width: 11px; height: 15px; border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  background: var(--xm-c); box-shadow: 0 0 10px 1px var(--xm-c); transform-origin: top center; animation: xm-tw ease-in-out infinite; }
.xm-light::before { content: ''; position: absolute; top: -5px; left: 50%; width: 8px; height: 5px; transform: translateX(-50%);
  border-bottom: 2px solid rgba(120, 90, 40, .4); border-radius: 0 0 6px 6px; }
.xm-snow { position: absolute; top: -4%; border-radius: 50%; background: #ffffff;
  box-shadow: 0 0 5px rgba(255, 255, 255, .8); animation: xm-fall linear infinite; }

@keyframes xm-tw { 0%, 100% { opacity: .45; filter: brightness(.85); } 50% { opacity: 1; filter: brightness(1.25); } }
@keyframes xm-fall {
  0% { transform: translateY(-6vh) translateX(0); }
  100% { transform: translateY(112vh) translateX(var(--xm-sway)); }
}
@media (prefers-reduced-motion: reduce) { .xm-snow, .xm-light { animation: none; } .xm-snow { display: none; } }
</style>
