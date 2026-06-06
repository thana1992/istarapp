<template>
  <div
    class="pride-overlay"
    :class="[{ 'is-backdrop': behind }]"
    aria-hidden="true"
  >
    <svg
      v-for="(h, i) in hearts"
      :key="'pr-heart-' + i"
      class="pr-heart"
      :class="'pr-c--' + h.color"
      :style="heartStyle(h)"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="currentColor"
      />
    </svg>
  </div>
</template>

<script>
// Pride flag order — drives the rainbow spread of floating hearts
const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'violet'];

function rand(min, max) { return Math.random() * (max - min) + min; }

export default {
  name: 'PrideOverlay',
  props: {
    behind: { type: Boolean, default: true },
    count: { type: Number, default: 42 },
  },
  data() {
    return { hearts: this.makeHearts(this.count) };
  },
  watch: {
    count(n) { this.hearts = this.makeHearts(n); },
  },
  methods: {
    makeHearts(n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push({
          top: rand(0, 100),
          left: rand(0, 100),
          size: rand(11, 22),
          // Spread the flag colors evenly so all six hues always show
          color: COLORS[i % COLORS.length],
          delay: rand(0, 7),
          duration: rand(4.5, 7),
          maxOpacity: rand(0.45, 0.8),
        });
      }
      return out;
    },
    heartStyle(h) {
      return {
        top: h.top + '%',
        left: h.left + '%',
        width: h.size + 'px',
        height: h.size + 'px',
        animationDelay: h.delay + 's',
        animationDuration: h.duration + 's',
        '--pr-max': h.maxOpacity,
      };
    },
  },
};
</script>

<style scoped>
.pride-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.pride-overlay.is-backdrop { z-index: 0; }

.pr-heart {
  position: absolute;
  opacity: 0;
  filter: drop-shadow(0 0 2px currentColor);
  /* transform + opacity only — GPU smooth */
  animation: pr-float ease-in-out infinite;
  will-change: opacity, transform;
}

/* Six-stripe Pride palette (yellow nudged to gold so it reads on light surfaces) */
.pr-c--red    { color: #e40303; }
.pr-c--orange { color: #ff8c00; }
.pr-c--yellow { color: #f5b700; }
.pr-c--green  { color: #00a651; }
.pr-c--blue   { color: #0066ff; }
.pr-c--violet { color: #8a2be2; }

@keyframes pr-float {
  0%   { opacity: 0;                  transform: translateY(10px) scale(0.6) rotate(-8deg); }
  45%  { opacity: var(--pr-max, 0.7); transform: translateY(-6px) scale(1)   rotate(0deg); }
  55%  { opacity: var(--pr-max, 0.7); transform: translateY(-10px) scale(1)  rotate(5deg); }
  100% { opacity: 0;                  transform: translateY(-24px) scale(0.7) rotate(9deg); }
}

@media (prefers-reduced-motion: reduce) {
  .pr-heart { animation: none; opacity: 0.4; }
}
</style>
