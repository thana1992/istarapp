<template>
  <!-- สงกรานต์ — bright summer sun, falling water droplets and splash ripples.
       Decorative only (pointer-events:none). transform/opacity animations only. -->
  <div class="sk-overlay" aria-hidden="true">
    <div class="sk-sun"></div>
    <span v-for="(d, i) in drops" :key="'skd-' + i" class="sk-drop" :style="dropStyle(d)"></span>
    <span v-for="(r, i) in ripples" :key="'skr-' + i" class="sk-ripple" :style="rippleStyle(r)"></span>
  </div>
</template>

<script>
import { rand } from '@/utils/random';

export default {
  name: 'SongkranOverlay',
  props: { dropCount: { type: Number, default: 18 }, rippleCount: { type: Number, default: 5 } },
  data() {
    return {
      drops: Array.from({ length: this.dropCount }, () => ({
        left: rand(0, 100), size: rand(6, 13), dur: rand(2.4, 4.6), delay: rand(-5, 0), sway: rand(6, 18),
      })),
      ripples: Array.from({ length: this.rippleCount }, () => ({
        left: rand(4, 96), bottom: rand(2, 30), size: rand(26, 60), dur: rand(3, 5), delay: rand(0, 4),
      })),
    };
  },
  methods: {
    dropStyle(d) { return { left: d.left + '%', width: d.size + 'px', height: d.size * 1.4 + 'px', '--sk-sway': d.sway + 'px', animationDuration: d.dur + 's', animationDelay: d.delay + 's' }; },
    rippleStyle(r) { return { left: r.left + '%', bottom: r.bottom + '%', width: r.size + 'px', height: r.size * 0.4 + 'px', animationDuration: r.dur + 's', animationDelay: r.delay + 's' }; },
  },
};
</script>

<style scoped>
.sk-overlay { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }
.sk-sun {
  position: absolute; top: 6%; right: 8%; width: clamp(110px, 15vw, 190px); aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle at 42% 38%, #fff6d8 0%, #ffd84d 50%, #ffb52e 100%);
  box-shadow: 0 0 50px 12px rgba(255, 200, 61, .42), 0 0 110px 30px rgba(255, 180, 60, .22);
  animation: sk-sun 6s ease-in-out infinite;
}
.sk-drop {
  position: absolute; top: -6%; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: linear-gradient(180deg, rgba(150, 226, 234, .35), rgba(47, 159, 224, .85));
  box-shadow: inset 0 -2px 3px rgba(255, 255, 255, .5); animation: sk-fall linear infinite;
}
.sk-ripple {
  position: absolute; border-radius: 50%; border: 2px solid rgba(47, 159, 224, .5);
  transform: scale(.2); opacity: 0; animation: sk-ripple ease-out infinite;
}
@keyframes sk-sun { 0%, 100% { transform: scale(1); opacity: .92; } 50% { transform: scale(1.05); opacity: 1; } }
@keyframes sk-fall {
  0% { transform: translateY(-10vh) translateX(0); }
  100% { transform: translateY(116vh) translateX(var(--sk-sway)); }
}
@keyframes sk-ripple { 0% { transform: scale(.2); opacity: .7; } 100% { transform: scale(1.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .sk-drop, .sk-ripple, .sk-sun { animation: none; } .sk-drop { display: none; } .sk-ripple { opacity: .3; } }
</style>
