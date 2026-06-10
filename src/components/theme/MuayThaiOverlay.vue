<template>
  <!-- มวยไทย — red-corner / blue-corner glows, a ceremonial gold mongkol ring,
       and drifting temple-gold embers. Decorative only. transform/opacity only. -->
  <div class="mt-overlay" aria-hidden="true">
    <div class="mt-corner mt-corner-red"></div>
    <div class="mt-corner mt-corner-blue"></div>
    <svg class="mt-mongkol" viewBox="0 0 120 70" aria-hidden="true">
      <ellipse cx="60" cy="40" rx="46" ry="24" fill="none" stroke="#d4a01e" stroke-width="5" />
      <ellipse cx="60" cy="40" rx="46" ry="24" fill="none" stroke="#f3cf6a" stroke-width="1.6" />
      <path d="M60 16 L54 4 L60 9 L66 4 Z" fill="#d4a01e" />
      <circle cx="60" cy="16" r="3.4" fill="#f3cf6a" />
    </svg>
    <span v-for="(e, i) in embers" :key="'mte-' + i" class="mt-ember" :style="emberStyle(e)"></span>
  </div>
</template>

<script>
import { rand } from '@/utils/random';

export default {
  name: 'MuayThaiOverlay',
  props: { emberCount: { type: Number, default: 16 } },
  data() {
    return {
      embers: Array.from({ length: this.emberCount }, () => ({
        left: rand(0, 100), size: rand(4, 9), dur: rand(6, 12), delay: rand(-12, 0), sway: rand(8, 22), op: rand(0.4, 0.85),
      })),
    };
  },
  methods: {
    emberStyle(e) { return { left: e.left + '%', width: e.size + 'px', height: e.size + 'px', opacity: e.op, '--mt-sway': e.sway + 'px', animationDuration: e.dur + 's', animationDelay: e.delay + 's' }; },
  },
};
</script>

<style scoped>
.mt-overlay { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }
.mt-corner { position: absolute; width: 46vw; height: 46vw; max-width: 560px; max-height: 560px; border-radius: 50%; opacity: .5; }
.mt-corner-red { top: -16%; left: -14%; background: radial-gradient(circle, rgba(184, 29, 44, .34), transparent 66%); animation: mt-pulse 7s ease-in-out infinite; }
.mt-corner-blue { bottom: -18%; right: -14%; background: radial-gradient(circle, rgba(28, 79, 143, .32), transparent 66%); animation: mt-pulse 8s ease-in-out infinite reverse; }
.mt-mongkol { position: absolute; top: 5%; left: 50%; width: clamp(120px, 18vw, 220px); transform: translateX(-50%);
  filter: drop-shadow(0 0 10px rgba(212, 160, 30, .4)); animation: mt-sway 6s ease-in-out infinite; transform-origin: top center; }
.mt-ember { position: absolute; bottom: -4%; border-radius: 50%; background: radial-gradient(circle, #ffe6a0, #d4a01e);
  box-shadow: 0 0 7px rgba(212, 160, 30, .7); animation: mt-rise linear infinite; }

@keyframes mt-pulse { 0%, 100% { opacity: .42; transform: scale(1); } 50% { opacity: .6; transform: scale(1.07); } }
@keyframes mt-sway { 0%, 100% { transform: translateX(-50%) rotate(-2.5deg); } 50% { transform: translateX(-50%) rotate(2.5deg); } }
@keyframes mt-rise {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  12% { opacity: 1; }
  100% { transform: translateY(-118vh) translateX(var(--mt-sway)); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .mt-corner, .mt-mongkol, .mt-ember { animation: none; } .mt-ember { display: none; } }
</style>
