<template>
  <div class="christmas-wrapper">
    <!-- CHRISTMAS BACKGROUND MUSIC -->
    <audio
      ref="christmasAudio"
      loop
      preload="auto"
      autoplay
      muted
      style="display: none;"
    >
      <source src="@/assets/theme/christmas/jingle-bells.mp3" type="audio/mpeg">
    </audio>

    <!-- SANTA SLEIGH -->
    <div v-if="showSanta" class="santa-sleigh" :style="santaStyle">
      <img 
        src="@/assets/theme/christmas/santa2.png" 
        alt="Santa Sleigh"
        class="santa-sleigh-img"
      />
    </div>

    <!-- CHRISTMAS OVERLAY CONTAINER -->
    <div
      class="christmas-overlay"
      :class="[{ 'is-backdrop': behind }]"
      aria-hidden="true"
    >
      <!-- SNOWFLAKES -->
    <div
      v-for="(flake, i) in snowflakes"
      :key="'snow-' + i"
      class="snowflake"
      :style="snowflakeStyle(flake)"
    >
      {{ flake.type }}
    </div>

    <!-- BOTTOM DECORATIONS -->
    <div class="bottom-decor">
      <template v-for="(d, i) in decorations" :key="i">
        <div
          class="decor-item"
          :style="{
            ...decorStyle(d),
            '--decor-rotation': `${d.rotation}deg`,
            '--decor-offset': `${d.offsetY}px`,
            '--decor-index': i
          }"
        >
          {{ d.emoji }}
        </div>
      </template>
    </div>

    <!-- SNOW ON GROUND -->
    <div class="snow-ground"></div>
    </div>
    <!-- End of christmas-overlay -->
  </div>
  <!-- End of christmas-wrapper -->
</template>

<script>
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function scatterVW(n, min = 5, max = 95, minGap = 8) {
  const xs = [];
  let tries = 0;
  while (xs.length < n && tries < 1000) {
    const v = +(Math.random() * (max - min) + min).toFixed(2);
    if (xs.every((x) => Math.abs(x - v) > minGap)) xs.push(v);
    tries++;
  }
  return xs.sort((a, b) => a - b);
}

export default {
  name: 'ChristmasOverlay',
  props: {
    behind: { type: Boolean, default: false },
    minDecor: { type: Number, default: 6 },
    maxDecor: { type: Number, default: 12 },
  },
  data() {
    return {
      snowflakes: [],
      lightsTop: [],
      decorations: [],
      showSanta: true,
      santaPosition: -50,
      santaBaseHeight: 15,
      animationFrames: {
        snowfall: null,
        santa: null,
      },
      audioPlaying: false,
    };
  },
  computed: {
    santaStyle() {
      const waveY = Math.sin(this.santaPosition * 0.1) * 5;
      return {
        left: `${this.santaPosition}%`,
        top: `${this.santaBaseHeight + waveY}%`,
      };
    },
    hasMusic() {
      return true;
    },
  },
  methods: {
    setVisible(v) {
      console.log('ChristmasOverlay setVisible:', v);
      
      const audio = this.$refs.christmasAudio;
      if (!audio) return;
      
      if (v) {
        console.log('🎵 Attempting to play audio...');
        console.log('Audio paused:', audio.paused);
        console.log('Audio muted:', audio.muted);
        
        if (audio.paused) {
          audio.play()
            .then(() => {
              audio.muted = false;
              audio.volume = 0.3;
              this.audioPlaying = true;
              this.$emit('audioStateChanged', true);
              console.log('✅ Audio started and unmuted!');
            })
            .catch(err => {
              console.warn('⚠️ Autoplay blocked:', err.message);
              console.log('🎯 Audio will play on first user interaction');
              audio.muted = true;
              audio.play().catch(() => {});
              this.audioPlaying = false;
              this.$emit('audioStateChanged', false);
            });
        } else {
          console.log('🔊 Unmuting audio...');
          audio.muted = false;
          audio.volume = 0.3;
          this.audioPlaying = true;
          this.$emit('audioStateChanged', true);
          console.log('✅ Christmas music unmuted and playing!');
        }
      } else {
        console.log('🔇 Muting audio...');
        audio.muted = true;
        this.audioPlaying = false;
        this.$emit('audioStateChanged', false);
        console.log('⏸️ Christmas music muted');
      }
    },

    playAudio() {
      const audio = this.$refs.christmasAudio;
      if (!audio) {
        console.error('❌ Audio element not found!');
        return;
      }
      
      if (this.audioPlaying) {
        console.log('ℹ️ Audio already playing');
        return;
      }

      console.log('🎵 Attempting to play audio...');
      console.log('📁 Audio src:', audio.currentSrc || audio.src);
      console.log('📊 Audio readyState:', audio.readyState, '(0=empty, 1=metadata, 2=current, 3=future, 4=enough)');
      console.log('⏸️ Audio paused:', audio.paused);
      console.log('🔇 Audio muted:', audio.muted);
      console.log('🔊 Audio volume:', audio.volume);
      console.log('⏱️ Audio duration:', audio.duration);
      console.log('❗ Audio error:', audio.error);
      
      audio.muted = false;
      audio.volume = 0.3;
      
      audio.play()
        .then(() => {
          this.audioPlaying = true;
          console.log('✅ Christmas music playing successfully!');
          console.log('▶️ Audio paused state after play:', audio.paused);
          console.log('🔊 Current volume:', audio.volume);
          this.$emit('audioStateChanged', this.audioPlaying);
        })
        .catch(err => {
          console.error('❌ Audio play failed:', err.name, err.message);
          console.error('💡 Error details:', err);
          console.log('👆 Please click the music button 🔊 to enable sound');
          console.log('🌐 Browser may block autoplay - user interaction required');
        });
    },

    pauseAudio() {
      if (this.$refs.christmasAudio && this.audioPlaying) {
        this.$refs.christmasAudio.pause();
        this.audioPlaying = false;
        console.log('Christmas music paused');
        this.$emit('audioStateChanged', this.audioPlaying);
      }
    },

    toggleAudio() {
      console.log('🔘 Music button clicked!');
      console.log('Current audioPlaying state:', this.audioPlaying);
      
      const audio = this.$refs.christmasAudio;
      if (!audio) return;
      
      console.log('Audio paused:', audio.paused);
      console.log('Audio muted:', audio.muted);
      
      if (this.audioPlaying) {
        console.log('🔇 Muting audio...');
        audio.muted = true;
        this.audioPlaying = false;
        this.$emit('audioStateChanged', false);
      } else {
        if (audio.paused) {
          console.log('▶️ Starting audio...');
          audio.play()
            .then(() => {
              audio.muted = false;
              audio.volume = 0.3;
              this.audioPlaying = true;
              this.$emit('audioStateChanged', true);
              console.log('✅ Audio started and playing!');
            })
            .catch(err => {
              console.error('❌ Failed to start audio:', err);
            });
        } else {
          console.log('🔊 Unmuting audio...');
          audio.muted = false;
          audio.volume = 0.3;
          this.audioPlaying = true;
          this.$emit('audioStateChanged', true);
        }
      }
    },

    enableAutoPlayAfterInteraction() {
      const tryAutoPlay = () => {
        if (!this.audioPlaying) {
          this.playAudio();
        }
        document.removeEventListener('click', tryAutoPlay);
        document.removeEventListener('keydown', tryAutoPlay);
        document.removeEventListener('touchstart', tryAutoPlay);
      };

      document.addEventListener('click', tryAutoPlay, { once: true });
      document.addEventListener('keydown', tryAutoPlay, { once: true });
      document.addEventListener('touchstart', tryAutoPlay, { once: true });
    },
    
    initSnowflakes() {
      const count = Math.floor(randomRange(60, 100));
      const snowflakeTypes = ['❄', '❅', '✻', '❆', '✼', '❊'];
      this.snowflakes = Array.from({ length: count }, () => ({
        x: randomRange(0, 100),
        y: randomRange(-100, 0),
        size: randomRange(30, 55),
        speedY: randomRange(0.01, 0.05),
        speedX: randomRange(-0.15, 0.15),
        opacity: randomRange(0.7, 1),
        rotation: randomRange(0, 360),
        rotationSpeed: randomRange(-0.5, 0.5),
        type: snowflakeTypes[Math.floor(Math.random() * snowflakeTypes.length)],
      }));
    },

    initLights() {
      const count = 25;
      this.lightsTop = Array.from({ length: count }, (_, i) => ({
        x: (i / count) * 100,
        color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][i % 5],
        delay: i * 0.1,
      }));
    },

    initDecorations() {
      const emojis = [
        '🎅', '⛄', '🎁', '🔔', '🕯️', '🧦', '🎄', '⭐', '❄️', '🦌', 
        '🤶', '🎀', '🍬', '🌟', '🎊',
      ];
      
      const count = Math.floor(randomRange(10, 16));
      const positions = scatterVW(count, 5, 95, 6);

      const shuffledEmojis = [...emojis].sort(() => Math.random() - 0.5);
      
      this.decorations = positions.map((x, index) => ({
        emoji: shuffledEmojis[index % shuffledEmojis.length],
        x,
        scale: randomRange(0.8, 2.5),
        rotation: randomRange(-25, 25),
        offsetY: randomRange(-20, 20),
        opacity: randomRange(0.85, 1),
      }));
      
      console.log('🎄 Created', this.decorations.length, 'decorations');
    },

    snowflakeStyle(flake) {
      return {
        left: `${flake.x}%`,
        top: `${flake.y}%`,
        fontSize: `${flake.size}px`,
        opacity: flake.opacity,
        transform: `rotate(${flake.rotation}deg)`,
      };
    },

    lightStyle(light, index) {
      return {
        left: `${light.x}%`,
        backgroundColor: light.color,
        animationDelay: `${light.delay}s`,
      };
    },

    decorStyle(decor) {
      return {
        left: `${decor.x}vw`,
        fontSize: `${decor.scale * 2}rem`,
        transform: `rotate(${decor.rotation}deg) translateY(${decor.offsetY}px)`,
        opacity: decor.opacity,
      };
    },

    animateSnowfall() {
      this.snowflakes.forEach((flake) => {
        flake.y += flake.speedY;
        flake.x += flake.speedX;
        flake.rotation += flake.rotationSpeed;

        if (flake.y > 110) {
          flake.y = -10;
          flake.x = randomRange(0, 100);
        }

        if (flake.x < -5) flake.x = 105;
        if (flake.x > 105) flake.x = -5;
      });

      this.animationFrames.snowfall = requestAnimationFrame(this.animateSnowfall);
    },

    animateSanta() {
      if (this.showSanta) {
        this.santaPosition += 0.08;
        
        if (this.santaPosition > 120) {
          this.showSanta = false;
          
          setTimeout(() => {
            this.santaPosition = -50;
            this.santaBaseHeight = randomRange(5, 65);
            console.log('🎅 Santa new height:', this.santaBaseHeight.toFixed(1) + '%');
            this.showSanta = true;
          }, 100);
        }
      }

      this.animationFrames.santa = requestAnimationFrame(this.animateSanta);
    },

    startSantaAnimation() {
      this.santaBaseHeight = randomRange(5, 65);
      console.log('🎅 Santa initial height:', this.santaBaseHeight.toFixed(1) + '%');
      this.animateSanta();
    },
  },

  mounted() {
    console.log('ChristmasOverlay mounted!');
    this.initSnowflakes();
    this.initDecorations();
    console.log('Initialized snowflakes:', this.snowflakes.length);
    console.log('Initialized decorations:', this.decorations.length);
    this.animateSnowfall();
    this.startSantaAnimation();
    
    this.enableAutoPlayAfterInteraction();
    
    const audio = this.$refs.christmasAudio;
    if (audio) {
      audio.addEventListener('loadeddata', () => {
        console.log('✅ Audio file loaded successfully');
        console.log('⏱️ Duration:', audio.duration, 'seconds');
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log('✅ Audio can play through without buffering');
      });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ Audio loading error:', e);
        console.error('Error code:', audio.error?.code);
        console.error('Error message:', audio.error?.message);
      });
      
      audio.addEventListener('playing', () => {
        console.log('▶️ Audio is now ACTUALLY playing!');
      });
      
      audio.addEventListener('pause', () => {
        console.log('⏸️ Audio paused');
      });
      
      audio.addEventListener('volumechange', () => {
        console.log('🔊 Volume changed to:', audio.volume);
      });
    }
  },

  beforeUnmount() {
    if (this.animationFrames.snowfall) {
      cancelAnimationFrame(this.animationFrames.snowfall);
    }
    if (this.animationFrames.santa) {
      cancelAnimationFrame(this.animationFrames.santa);
    }
    this.pauseAudio();
  },
};
</script>

<style scoped>
.christmas-wrapper {
  display: contents;
}

.christmas-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
  will-change: opacity;
  contain: layout style paint;
  transform: translateZ(0);
}

.christmas-overlay.is-backdrop {
  z-index: 5;
}

/* SNOWFLAKES */
.snowflake {
  position: absolute;
  color: #ffffff;
  pointer-events: none;
  user-select: none;
  will-change: transform, top, left;
  font-weight: bold;
}

/* SANTA SLEIGH */
.santa-sleigh {
  position: fixed !important;
  z-index: 50 !important;
  pointer-events: none !important;
  animation: santa-fly 1.5s ease-in-out infinite alternate;
  filter: drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.3));
  transition: left 0.3s linear, top 0.1s ease-out;
  will-change: left, top;
}

.santa-sleigh-img {
  height: 120px;
  width: auto;
  display: block;
  object-fit: contain;
}

@keyframes santa-fly {
  0% {
    transform: translateY(0px) rotate(-2deg);
  }
  100% {
    transform: translateY(-8px) rotate(2deg);
  }
}

/* BOTTOM DECORATIONS */
.bottom-decor {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 0 5%;
}

.decor-item {
  position: absolute;
  bottom: 0;
  pointer-events: none;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  user-select: none;
  transition: transform 0.3s ease-out;
  animation: decor-gentle-sway 3s ease-in-out infinite;
  animation-delay: calc(var(--decor-index, 0) * 0.2s);
}

@keyframes decor-gentle-sway {
  0%, 100% {
    transform: rotate(var(--decor-rotation, 0deg)) translateY(var(--decor-offset, 0px)) scale(1);
  }
  50% {
    transform: rotate(calc(var(--decor-rotation, 0deg) + 3deg)) translateY(calc(var(--decor-offset, 0px) - 5px)) scale(1.05);
  }
}

/* SNOW ON GROUND */
.snow-ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(
    to top,
    rgba(224, 247, 250, 0.8) 0%,
    rgba(179, 229, 252, 0.5) 50%,
    transparent 100%
  );
  border-radius: 50% 50% 0 0;
  pointer-events: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .santa-sleigh {
    font-size: 2rem;
  }

  .decor-item {
    font-size: 1.5rem !important;
  }

  .pine-branch-container {
    width: 220px;
    height: 140px;
  }

  .pine-branch-container.left .pine-needles.layer-1 {
    width: 140px;
    height: 70px;
  }

  .pine-branch-container.left .pine-needles.layer-2 {
    width: 120px;
    height: 60px;
  }

  .pine-branch-container.left .pine-needles.layer-3 {
    width: 100px;
    height: 50px;
  }

  .pine-branch-container.left .pine-needles.layer-4 {
    width: 85px;
    height: 42px;
  }

  .pine-branch-container.right .pine-needles.layer-1 {
    width: 140px;
    height: 70px;
  }

  .pine-branch-container.right .pine-needles.layer-2 {
    width: 120px;
    height: 60px;
  }

  .pine-branch-container.right .pine-needles.layer-3 {
    width: 100px;
    height: 50px;
  }

  .pine-branch-container.right .pine-needles.layer-4 {
    width: 85px;
    height: 42px;
  }

  .ornament {
    font-size: 1.6rem;
  }

  .ornament.red-ball {
    font-size: 1.8rem;
  }

  .ornament.gold-star,
  .ornament.ribbon-red {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .santa-sleigh {
    font-size: 1.5rem;
  }

  .light {
    width: 8px;
    height: 8px;
  }

  .pine-branch-container {
    width: 160px;
    height: 100px;
  }

  .pine-branch-container.left .pine-needles.layer-1 {
    width: 100px;
    height: 50px;
  }

  .pine-branch-container.left .pine-needles.layer-2 {
    width: 85px;
    height: 42px;
  }

  .pine-branch-container.left .pine-needles.layer-3 {
    width: 72px;
    height: 36px;
  }

  .pine-branch-container.left .pine-needles.layer-4 {
    width: 60px;
    height: 30px;
  }

  .pine-branch-container.right .pine-needles.layer-1 {
    width: 100px;
    height: 50px;
  }

  .pine-branch-container.right .pine-needles.layer-2 {
    width: 85px;
    height: 42px;
  }

  .pine-branch-container.right .pine-needles.layer-3 {
    width: 72px;
    height: 36px;
  }

  .pine-branch-container.right .pine-needles.layer-4 {
    width: 60px;
    height: 30px;
  }

  .ornament {
    font-size: 1.2rem;
  }

  .ornament.red-ball {
    font-size: 1.4rem;
  }

  .ornament.gold-star,
  .ornament.ribbon-red {
    font-size: 1rem;
  }

  .ornament.gold-ball,
  .ornament.silver-ball {
    font-size: 1.2rem;
  }
}
</style>

<!-- Global Christmas Theme Styles (unscoped) -->
<style>
html.theme-christmas {
  background: #e1f5fe;
}

body.theme-christmas {
  background: transparent !important;
}

body.theme-christmas::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #e1f5fe 0%,
    #f0f8ff 25%,
    #ffffff 50%,
    #f5f9fc 75%,
    #e8f4f8 100%
  );
  z-index: -1;
  pointer-events: none;
  contain: layout style paint;
  transform: translateZ(0);
}

html.theme-christmas,
html.theme-christmas body,
html.theme-christmas #app,
html.theme-christmas .v-application,
html.theme-christmas .v-application__wrap {
  background-color: transparent !important;
}

.theme-christmas .v-application,
.theme-christmas .v-application__wrap {
  background: transparent !important;
}

.theme-christmas .v-main,
.theme-christmas .root-container {
  background: transparent !important;
}

.theme-christmas .v-layout {
  background: transparent !important;
}

.theme-christmas .v-main .v-card:not(.v-dialog > .v-card),
.theme-christmas .root-container .v-card:not(.v-dialog > .v-card) {
  background: rgba(255, 255, 255, 0.9) !important;
}

.theme-christmas .v-app > .v-card,
body.theme-christmas > #app > .v-application > .v-card {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.theme-christmas .v-card--variant-elevated:not(.v-dialog .v-card),
.theme-christmas .v-card--variant-flat:not(.v-dialog .v-card) {
  background: transparent !important;
}

.theme-christmas .v-card > .v-layout {
  background: transparent !important;
}

.theme-christmas .card-opacity {
  background: rgba(255, 255, 255, 0.92) !important;
}

.theme-christmas .v-dialog > .v-overlay__content > .v-card,
.theme-christmas .v-dialog .v-card {
  background: rgb(255, 255, 255) !important;
  opacity: 1 !important;
}

.theme-christmas a {
  color: #c62828;
}

.theme-christmas .header-card {
  background: linear-gradient(135deg, #c62828 0%, #2e7d32 100%) !important;
  color: white !important;
}
</style>
