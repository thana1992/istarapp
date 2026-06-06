<template>
  <div
    class="neu-overlay"
    :class="[{ 'is-backdrop': behind }]"
    aria-hidden="true"
  >
    <svg
      v-for="(g, i) in gems"
      :key="'neu-gem-' + i"
      class="neu-gem"
      :class="'neu-c--' + g.color"
      :style="gemStyle(g)"
      viewBox="0 0 24 24"
    >
      <!-- Faceted gem: filled body + crystalline facet lines -->
      <path d="M12 3 L20 10 L12 21 L4 10 Z" fill="currentColor" />
      <path
        d="M4 10 H20 M12 3 L9 10 L12 21 M12 3 L15 10 L12 21"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        stroke-width="0.7"
      />
    </svg>
  </div>
</template>

<script>
// Soft neumorphic gem palette — glows gently on the dark app surface
const COLORS = ['lavender', 'indigo', 'periwinkle', 'mist', 'teal'];

function rand(min, max) { return Math.random() * (max - min) + min; }

export default {
  name: 'NeumorphicOverlay',
  props: {
    behind: { type: Boolean, default: true },
    count: { type: Number, default: 26 },
  },
  data() {
    return { gems: this.makeGems(this.count) };
  },
  watch: {
    count(n) { this.gems = this.makeGems(n); },
  },
  methods: {
    makeGems(n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        out.push({
          top: rand(0, 100),
          left: rand(0, 100),
          size: rand(12, 24),
          color: COLORS[i % COLORS.length],
          delay: rand(0, 8),
          duration: rand(6, 9),
          spin: rand(0, 1) > 0.5 ? 1 : -1,
          maxOpacity: rand(0.18, 0.42),
        });
      }
      return out;
    },
    gemStyle(g) {
      return {
        top: g.top + '%',
        left: g.left + '%',
        width: g.size + 'px',
        height: g.size + 'px',
        animationDelay: g.delay + 's',
        animationDuration: g.duration + 's',
        '--neu-max': g.maxOpacity,
        '--neu-spin': g.spin * 18 + 'deg',
      };
    },
  },
};
</script>

<style scoped>
.neu-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.neu-overlay.is-backdrop { z-index: 0; }

.neu-gem {
  position: absolute;
  opacity: 0;
  filter: drop-shadow(0 0 6px currentColor);
  /* transform + opacity only — GPU smooth */
  animation: neu-float ease-in-out infinite;
  will-change: opacity, transform;
}

/* Soft, slightly luminous tones that read on a dark surface */
.neu-c--lavender   { color: #c7d2fe; }
.neu-c--indigo     { color: #a5b4fc; }
.neu-c--periwinkle { color: #818cf8; }
.neu-c--mist       { color: #e0e7ff; }
.neu-c--teal       { color: #5eead4; }

@keyframes neu-float {
  0%   { opacity: 0;                   transform: translateY(12px) scale(0.7) rotate(0deg); }
  45%  { opacity: var(--neu-max, 0.3); transform: translateY(-4px) scale(1)   rotate(var(--neu-spin, 12deg)); }
  55%  { opacity: var(--neu-max, 0.3); transform: translateY(-8px) scale(1)   rotate(var(--neu-spin, 12deg)); }
  100% { opacity: 0;                   transform: translateY(-22px) scale(0.78) rotate(0deg); }
}

@media (prefers-reduced-motion: reduce) {
  .neu-gem { animation: none; opacity: 0.22; }
}
</style>
