<template>
  <div
    class="istar-overlay"
    :class="[{ 'is-backdrop': behind }]"
    aria-hidden="true"
  >
    <!-- Twinkling stars -->
    <svg
      v-for="(s, i) in stars"
      :key="'is-star-' + i"
      class="is-star"
      :class="'is-c--' + s.color"
      :style="starStyle(s)"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 2 L14.7 9.1 L22 9.5 L16.3 14.1 L18.3 21 L12 17 L5.7 21 L7.7 14.1 L2 9.5 L9.3 9.1 Z"
        fill="currentColor"
      />
    </svg>

    <!-- Shooting stars (tail + bright head) -->
    <i
      v-for="(sh, i) in shoots"
      :key="'is-shoot-' + i"
      class="is-shoot"
      :style="shootStyle(sh)"
    ></i>
  </div>
</template>

<script>
const STAR_COLORS = ['pink', 'rose', 'hot', 'gold', 'amber'];

function rand(min, max) { return Math.random() * (max - min) + min; }

export default {
  name: 'IstarOverlay',
  props: {
    behind: { type: Boolean, default: true },
    count: { type: Number, default: 32 },
    shootCount: { type: Number, default: 4 },
  },
  data() {
    return {
      stars: this.makeStars(this.count),
      shoots: this.makeShoots(this.shootCount),
    };
  },
  watch: {
    count(n) { this.stars = this.makeStars(n); },
    shootCount(n) { this.shoots = this.makeShoots(n); },
  },
  methods: {
    makeStars(n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push({
          top: rand(0, 100),
          left: rand(0, 100),
          size: rand(8, 16),
          color: STAR_COLORS[i % STAR_COLORS.length],
          delay: rand(0, 6),
          duration: rand(3.5, 5.5),
          maxOpacity: rand(0.5, 0.9),
        });
      }
      return out;
    },
    makeShoots(n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push({
          top: rand(-5, 45),
          left: rand(-15, 45),
          length: rand(70, 120),
          delay: rand(0, 9),
          duration: rand(3.5, 6),
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
        '--is-max': s.maxOpacity,
      };
    },
    shootStyle(sh) {
      return {
        top: sh.top + '%',
        left: sh.left + '%',
        width: sh.length + 'px',
        animationDelay: sh.delay + 's',
        animationDuration: sh.duration + 's',
      };
    },
  },
};
</script>

<style scoped>
.istar-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.istar-overlay.is-backdrop { z-index: 0; }

/* ── Twinkling stars ── */
.is-star {
  position: absolute;
  opacity: 0;
  filter: drop-shadow(0 0 3px currentColor);
  animation: is-twinkle ease-in-out infinite;
  will-change: opacity, transform;
}
.is-c--pink  { color: #f9a8d4; }
.is-c--rose  { color: #f472b6; }
.is-c--hot   { color: #ec4899; }
.is-c--gold  { color: #fbbf24; }
.is-c--amber { color: #fcd34d; }

@keyframes is-twinkle {
  0%, 100% { opacity: 0;                  transform: scale(0.55) rotate(0deg); }
  45%      { opacity: var(--is-max, 0.8); transform: scale(1) rotate(8deg); }
  55%      { opacity: var(--is-max, 0.8); transform: scale(1) rotate(8deg); }
}

/* ── Shooting stars — diagonal streak with a glowing head ── */
.is-shoot {
  position: absolute;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.35) 60%, #fde68a 100%);
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.8));
  opacity: 0;
  transform: rotate(35deg);
  transform-origin: right center;
  animation: is-shoot-move linear infinite;
  will-change: opacity, transform;
}
.is-shoot::after {
  content: '';
  position: absolute;
  right: -2px;
  top: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 8px 2px #fde68a, 0 0 14px 4px rgba(251, 191, 36, 0.5);
}

@keyframes is-shoot-move {
  0%   { opacity: 0; transform: translate(-18vw, -12vh) rotate(35deg) scaleX(0.3); }
  8%   { opacity: 1; }
  70%  { opacity: 1; }
  100% { opacity: 0; transform: translate(55vw, 38vh) rotate(35deg) scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .is-star  { animation: none; opacity: 0.5; }
  .is-shoot { animation: none; opacity: 0; }
}
</style>
