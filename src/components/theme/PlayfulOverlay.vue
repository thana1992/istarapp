<template>
  <div
    class="playful-overlay"
    :class="[{ 'is-backdrop': behind }]"
    aria-hidden="true"
  >
    <svg
      v-for="(s, i) in stars"
      :key="'pf-star-' + i"
      class="pf-star"
      :class="'pf-c--' + s.color"
      :style="starStyle(s)"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 2 L14.7 9.1 L22 9.5 L16.3 14.1 L18.3 21 L12 17 L5.7 21 L7.7 14.1 L2 9.5 L9.3 9.1 Z"
        fill="currentColor"
      />
    </svg>
  </div>
</template>

<script>
const COLORS = [
  'hot-pink',
  'soft-pink',
  'rose-soft',
  'red-soft',
  'amber',
  'mint',
  'lavender',
];

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export default {
  name: 'PlayfulOverlay',
  props: {
    behind: { type: Boolean, default: true },
    count: { type: Number, default: 50 },
  },
  data() {
    return { stars: this.makeStars(this.count) };
  },
  watch: {
    count(n) { this.stars = this.makeStars(n); },
  },
  methods: {
    makeStars(n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push({
          top: rand(0, 100),
          left: rand(0, 100),
          size: rand(10, 18),
          color: pick(COLORS),
          delay: rand(0, 6),
          duration: rand(3.5, 5.5),
          maxOpacity: rand(0.55, 0.95),
        });
      }
      return out;
    },
    starStyle(s) {
      return {
        top: s.top + '%',
        left: s.left + '%',
        width: s.size + 'px',
        height: s.size + 'px',
        animationDelay: s.delay + 's',
        animationDuration: s.duration + 's',
        '--pf-max': s.maxOpacity,
      };
    },
  },
};
</script>

<style scoped>
.playful-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.playful-overlay.is-backdrop { z-index: 0; }

.pf-star {
  position: absolute;
  opacity: 0;
  filter: drop-shadow(0 0 1.5px currentColor);
  animation: pf-twinkle ease-in-out infinite;
  will-change: opacity, transform;
}

/* Pastel palette tuned to match the mockup */
.pf-c--hot-pink  { color: #ec4899; }
.pf-c--soft-pink { color: #fbcfe8; }
.pf-c--rose-soft { color: #fda4af; }
.pf-c--red-soft  { color: #fca5a5; }
.pf-c--amber     { color: #fde68a; }
.pf-c--mint      { color: #99f6e4; }
.pf-c--lavender  { color: #ddd6fe; }

@keyframes pf-twinkle {
  0%, 100% { opacity: 0;                    transform: scale(0.55); }
  45%      { opacity: var(--pf-max, 0.85);  transform: scale(1); }
  55%      { opacity: var(--pf-max, 0.85);  transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .pf-star { animation: none; opacity: 0.45; }
}
</style>
