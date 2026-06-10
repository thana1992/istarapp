<template>
  <!-- ฮาโลวีน — full moon, bats drifting across, low ground fog and a few
       glowing sparks. Decorative only. transform/opacity animations only. -->
  <div class="hw-overlay" aria-hidden="true">
    <div class="hw-moon"></div>
    <span v-for="(b, i) in bats" :key="'hwb-' + i" class="hw-bat" :style="batStyle(b)">
      <span class="hw-bat-flap">
        <svg viewBox="0 0 64 28" :width="b.size">
          <path d="M32 10 C30 4 26 6 24 10 C20 4 12 2 4 8 C12 8 14 14 18 14 C12 16 10 22 14 24 C18 20 24 18 32 22 C40 18 46 20 50 24 C54 22 52 16 46 14 C50 14 52 8 60 8 C52 2 44 4 40 10 C38 6 34 4 32 10 Z"
            fill="#241433" />
        </svg>
      </span>
    </span>
    <span v-for="(s, i) in sparks" :key="'hws-' + i" class="hw-spark" :style="sparkStyle(s)"></span>
    <div class="hw-fog hw-fog-1"></div>
    <div class="hw-fog hw-fog-2"></div>
  </div>
</template>

<script>
import { rand, pick } from '@/utils/random';

export default {
  name: 'HalloweenOverlay',
  props: { batCount: { type: Number, default: 6 }, sparkCount: { type: Number, default: 8 } },
  data() {
    return {
      bats: Array.from({ length: this.batCount }, () => ({
        top: rand(8, 64), size: rand(26, 50), dur: rand(14, 26), delay: rand(-26, 0), bob: rand(8, 22), flap: rand(0.4, 0.7),
      })),
      sparks: Array.from({ length: this.sparkCount }, () => ({
        left: rand(3, 96), top: rand(10, 80), size: rand(4, 8), color: pick(['#f0922e', '#9a63f0']),
        dur: rand(2.4, 4.4), delay: rand(0, 4),
      })),
    };
  },
  methods: {
    batStyle(b) { return { top: b.top + '%', '--hw-bob': b.bob + 'px', '--hw-flap': b.flap + 's', animationDuration: b.dur + 's', animationDelay: b.delay + 's' }; },
    sparkStyle(s) { return { left: s.left + '%', top: s.top + '%', width: s.size + 'px', height: s.size + 'px', background: s.color, boxShadow: '0 0 8px ' + s.color, animationDuration: s.dur + 's', animationDelay: s.delay + 's' }; },
  },
};
</script>

<style scoped>
.hw-overlay { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }
.hw-moon {
  position: absolute; top: 6%; right: 9%; width: clamp(100px, 13vw, 170px); aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle at 38% 36%, #fff6e0 0%, #ffe6a8 55%, #f0b84a 100%);
  box-shadow: 0 0 44px 10px rgba(255, 200, 120, .34), inset -10px -8px 0 rgba(180, 140, 70, .18);
}
.hw-bat { position: absolute; left: -8%; animation: hw-cross linear infinite; }
.hw-bat-flap { display: inline-block; animation: hw-flap ease-in-out infinite alternate; animation-duration: var(--hw-flap, .5s); }
.hw-spark { position: absolute; border-radius: 50%; opacity: 0; animation: hw-tw ease-in-out infinite; }
.hw-fog { position: absolute; left: -10%; right: -10%; height: 120px; bottom: -30px; border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(124, 58, 237, .14), transparent 70%); filter: none; }
.hw-fog-1 { animation: hw-fog 16s ease-in-out infinite; }
.hw-fog-2 { bottom: -56px; opacity: .7; animation: hw-fog 22s ease-in-out infinite reverse; }

@keyframes hw-cross { 0% { transform: translateX(0) translateY(0); } 100% { transform: translateX(120vw) translateY(calc(var(--hw-bob) * -1)); } }
@keyframes hw-flap { from { transform: scaleY(.62); } to { transform: scaleY(1); } }
@keyframes hw-tw { 0%, 100% { opacity: 0; transform: scale(.5); } 50% { opacity: .9; transform: scale(1); } }
@keyframes hw-fog { 0%, 100% { transform: translateX(-4%); } 50% { transform: translateX(4%); } }
@media (prefers-reduced-motion: reduce) { .hw-bat, .hw-bat-flap, .hw-spark, .hw-fog { animation: none; } .hw-bat { display: none; } .hw-spark { opacity: .6; } }
</style>
