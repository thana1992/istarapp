<template>
  <div
    v-show="visible"
    class="halloween-overlay"
    :class="[{ 'is-backdrop': behind }]"
    aria-hidden="true"
  >
    <!-- MOON -->
    <div class="moon-wrap">
      <img class="moon-img" src="@/assets/theme/halloween/moon.png" alt="moon" />
      <div class="moon-glow"></div>
    </div>

    <!-- CORNER WEBS -->
    <svg v-if="showWebs" class="web web-tl" viewBox="0 0 200 200">
      <g stroke="rgba(255,255,255,.85)" stroke-width="3" fill="none">
        <path d="M0 0 L160 0" />
        <path d="M0 0 L0 160" />
        <path d="M0 0 L130 26" />
        <path d="M0 0 L26 130" />
        <path d="M0 65 Q65 0 130 0" />
        <path d="M0 105 Q105 0 180 0" />
        <path d="M0 140 Q140 0 200 0" />
      </g>
    </svg>
    <svg v-if="showWebs" class="web web-tr" viewBox="0 0 200 200">
      <g stroke="rgba(255,255,255,.85)" stroke-width="2" fill="none">
        <path d="M200 0 L40 0" />
        <path d="M200 0 L200 160" />
        <path d="M200 0 L70 26" />
        <path d="M200 0 L174 130" />
        <path d="M200 65 Q135 0 70 0" />
        <path d="M200 105 Q95 0 20 0" />
        <path d="M200 140 Q60 0 0 0" />
      </g>
    </svg>

    <!-- FOG -->
    <div class="fog-layer fog1"></div>
    <div class="fog-layer fog2"></div>
    <div class="fog-layer fog3"></div>

    <!-- BATS -->
    <div
      v-for="(b, i) in bats"
      :key="'bat-' + i"
      class="bat-wrap"
      :style="wrapStyle(i)"
    >
      <svg class="bat" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
        <g class="bat-root" :style="batScaleStyle(i)">
          <g class="wing wing-left">
            <path
              d="M100,48 C78,30 58,24 38,28 C24,31 14,42 8,56 C24,52 42,60 60,72 C76,82 88,86 98,82 Z"
              fill="currentColor"
            />
          </g>
          <g class="body">
            <circle cx="100" cy="60" r="10" fill="currentColor" />
            <path d="M92,48 l8,-12 l8,12 l-8,8 z" fill="currentColor" />
          </g>
          <g class="wing wing-right">
            <path
              d="M100,48 C122,30 142,24 162,28 C176,31 186,42 192,56 C176,52 158,60 140,72 C124,82 112,86 102,82 Z"
              fill="currentColor"
            />
          </g>
        </g>
      </svg>
    </div>

    <div class="bottom-decor">
      <template v-for="(d,i) in decor" :key="i">
        <img
          class="decor-img"
          :src="getImageSrc(d)"
          :alt="d.kind"
          :style="decorStyle(d)"
          @click.stop="bounce(d, $event)"
        />
      </template>
    </div>
  </div>
</template>

<script>
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function scatterVW(n, min = 6, max = 94, minGap = 7) {
  const xs = []; let tries = 0;
  while (xs.length < n && tries < 1200) {
    const v = +(Math.random() * (max - min) + min).toFixed(2);
    if (xs.every(x => Math.abs(x - v) > minGap)) xs.push(v);
    tries++;
  }
  return xs.sort((a,b)=>a-b);
}

export default {
  name: 'HalloweenOverlay',
  props: {
    behind:   { type: Boolean, default: true },
    showWebs: { type: Boolean, default: true },
    minDecor: { type: Number,  default: 8 },
    maxDecor: { type: Number,  default: 12 },
    skullRatio: { type: Number, default: 0.4 },
  },
  data() {
    const imageSets = {
      pumpkins: [
        require('@/assets/theme/halloween/decor/pumpkin-1.webp'),
        require('@/assets/theme/halloween/decor/pumpkin-2.webp'),
        require('@/assets/theme/halloween/decor/pumpkin-3.webp'),
        require('@/assets/theme/halloween/decor/pumpkin-4.webp'),
        require('@/assets/theme/halloween/decor/pumpkin-5.webp'),
      ],
      skulls: [
        require('@/assets/theme/halloween/decor/skull-1.webp'),
        require('@/assets/theme/halloween/decor/skull-2.webp'),
      ],
      bones:  [ require('@/assets/theme/halloween/decor/bone-1.webp') ],
      ghosts: [ require('@/assets/theme/halloween/decor/ghost-1.webp') ],
    };

    // bats
    const TAU = Math.PI * 2;
    const bats = Array.from({ length: 8 }).map(() => ({
      size:  0.3 + Math.random() * 0.4,
      dur:   22 + Math.random() * 18,
      speed: 0.35 + Math.random() * 0.45,
      amp:   6 + Math.random() * 10,
      yBase: 20 + Math.random() * 60,
      phase: Math.random() * TAU,
      flip:  Math.random() < 0.5 ? -1 : 1,
      delay: Math.random() * 900,

      jitterPhase: Math.random() * TAU,
      jitterSpeed: 0.006 + Math.random() * 0.008,
      jitterAmp:   0.8  + Math.random() * 1.4,
      ySmooth: null,
    }));

    // decor
    const want = Math.floor(
      clamp(this.minDecor, 0, 60) +
      Math.random() * (clamp(this.maxDecor, 0, 70) - clamp(this.minDecor, 0, 60) + 1)
    );
    const xs = scatterVW(want, 6, 94, 7);
    const types = ['pumpkin','skull','bone','ghost'];

    const decor = xs.map(x => {
      const kind = types[Math.floor(Math.random() * types.length)];
      return {
        kind,
        xvw: x,
        raise: Math.floor(Math.random() * 40), // กระจายสูงต่ำ
        scale: +(0.7 + Math.random() * 0.9).toFixed(2),
        rot: Math.floor(-10 + Math.random() * 20),
        imgIndex: 0
      };
    });

    decor.forEach(d => {
      if (d.kind === 'pumpkin') d.imgIndex = Math.floor(Math.random() * imageSets.pumpkins.length);
      else if (d.kind === 'skull') d.imgIndex = Math.floor(Math.random() * imageSets.skulls.length);
      else if (d.kind === 'bone') d.imgIndex = 0;
      else if (d.kind === 'ghost') d.imgIndex = 0;
    });

    return { visible: true, bats, decor, imageSets, rafId: null };
  },
  mounted() { this.loop(); },
  beforeUnmount() { if (this.rafId) cancelAnimationFrame(this.rafId); },
  methods: {
    setVisible(v){ this.visible = v; },

    loop() {
      this.bats.forEach(b => {
        b.phase       += 0.02 * b.speed;
        b.jitterPhase += b.jitterSpeed;

        const yTarget =
          b.yBase
          + Math.sin(b.phase)        * b.amp   * 0.6
          + Math.sin(b.jitterPhase)  * b.jitterAmp;

        b.ySmooth = (b.ySmooth == null)
          ? yTarget
          : (b.ySmooth * 0.88 + yTarget * 0.12);
      });
      this.rafId = requestAnimationFrame(this.loop);
    },

    wrapStyle(i) {
      const b = this.bats[i];
      const y = b.ySmooth ?? (b.yBase + Math.sin(b.phase) * b.amp * 0.6);
      return {
        top: `${y}vh`,
        left: `-22vw`,
        animationDelay: `${b.delay}ms`,
        animationDuration: `${b.dur}s`,
      };
    },
    batScaleStyle(i) {
      const b = this.bats[i];
      return { transform: `scale(${b.size * b.flip}, ${b.size})` };
    },

    getImageSrc(d) {
      const set = this.imageSets;
      if (d.kind === 'pumpkin') return set.pumpkins[d.imgIndex];
      if (d.kind === 'skull')   return set.skulls[d.imgIndex];
      if (d.kind === 'bone')    return set.bones[0];
      if (d.kind === 'ghost')   return set.ghosts[0];
      return '';
    },
    decorStyle(d) {
      return {
        position: 'absolute',
        left: `${d.xvw}vw`,
        bottom: `${d.raise}px`,
        '--rot': `${d.rot}deg`,
        transform: `translateX(-50%) scale(${d.scale})`,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.4))',
        pointerEvents: 'auto',
        cursor: 'pointer',
      };
    },

    bounce(d, event) {
      const el = event.currentTarget;
      if (!el) return;

      // 1) ป้องกัน floaty มาทับ: reset animation style ก่อน
      el.style.animation = 'none';
      // force reflow
      void el.offsetWidth;

      // 2) รีสตาร์ทด้วยคลาสเด้ง (ใส่คลาสที่จะชนะด้วย !important ใน CSS)
      el.classList.remove('is-bouncing');
      void el.offsetWidth; 
      el.classList.add('is-bouncing');

      // 3) หลังเด้งเสร็จ เอา style/คลาสออก เพื่อกลับไปลอยต่อ
      el.addEventListener('animationend', () => {
        el.classList.remove('is-bouncing');
        el.style.animation = '';  // คืนค่าให้ floaty จากกฎปกติกลับมาทำงาน
      }, { once: true });

      // (optional) ขยับตำแหน่งเล็กน้อย เพิ่มความรู้สึกเด้งแล้วตกลงจุดใหม่
      const shift = (Math.random() - 0.5) * 6; // -3..+3 vw
      d.xvw = Math.max(5, Math.min(95, d.xvw + shift));
    }

  }
};
</script>

<style scoped>
/* ===== Z-INDEX & CLICK BEHAVIOR ===== */
/* overlay เองไม่กินคลิก (ยกเว้นส่วนที่อนุญาต) */
.halloween-overlay {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: transparent;
  pointer-events: none;           /* ⛔️ overlay ทั้งก้อนไม่ดักคลิก */
}
.is-backdrop { z-index: 0; }

/* ให้เฉพาะเลเยอร์ที่ต้องคลิกได้ “เปิด” event */
.bottom-decor {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  z-index: 1;
  pointer-events: auto;           /* ✅ เปิดคลิกที่ container นี้ */
  isolation: isolate;
}
.decor-img {
  width: 70px;
  height: auto;
  object-fit: contain;
  position: absolute;
  transform-origin: bottom center;
  pointer-events: auto;           /* ✅ ให้รับคลิกแน่นอน */
  cursor: pointer;
  /* ลอยเบาๆ ตามปกติ */
  animation: floaty 6s ease-in-out infinite;
}
/* เลเยอร์อื่น ๆ ไม่ต้องคลิกได้ */
.web, .fog-layer, .bat-wrap, .moon-wrap { pointer-events: none; }

/* ===== MOON ===== */
.moon-wrap{
  position:absolute; right:1vw; top:19vh; width:230px; height:230px;
  transform-origin: 50% 50%;
  animation: moonSway 6s ease-in-out infinite;
}

/* Media Query สำหรับจอคอมพิวเตอร์ (หน้าจอกว้าง) */
@media (min-width: 768px) {
  .moon-wrap {
    right: 3vw; 
    top: 5vh; 
    width: 280px; 
    height: 280px;
  }
}

/* Media Query สำหรับจอใหญ่มาก (Desktop) */
@media (min-width: 1200px) {
  .moon-wrap {
    right: 5vw; 
    top: 8vh; 
    width: 320px; 
    height: 320px;
  }
}
.moon-img{ width:100%; height:100%; object-fit: contain; }
.moon-glow{
  position:absolute; inset:-40px; border-radius:50%;
  background: radial-gradient(circle, rgba(255,208,140,.45), transparent 70%);
  animation: moonPulse 5.4s ease-in-out infinite;
}
@keyframes moonPulse{ 0%,100%{opacity:.45; transform:scale(1)} 50%{opacity:.9; transform:scale(1.08)} }
@keyframes moonSway { 0%,100%{ transform: rotate(-5deg)} 50%{ transform: rotate(5deg)} }

/* ===== SPIDER WEBS ===== */
.web{ position:absolute; width:220px; height:220px; opacity:.95; filter:drop-shadow(0 1px 0 rgba(0,0,0,.28)); }
.web-tl{ left:0; top:0; transform: translate(-6px,-6px); }
.web-tr{ right:0; top:0; transform: translate(6px,-6px); }

/* ===== FOG ===== */
.fog-layer{ position:absolute; inset:0; opacity:.34; mix-blend-mode: screen; }
.fog1{ animation: fogDrift1 36s linear infinite; opacity:.36; }
.fog2{ animation: fogDrift2 52s linear infinite; opacity:.30; }
.fog3{ animation: fogDrift3 70s linear infinite; opacity:.24; }
@keyframes fogDrift1{ 0%{transform:translateX(0)} 50%{transform:translateX(24px)} 100%{transform:translateX(0)} }
@keyframes fogDrift2{ 0%{transform:translateX(-14px)} 50%{transform:translateX(16px)} 100%{transform:translateX(-14px)} }
@keyframes fogDrift3{ 0%{transform:translateY(-4px)} 50%{transform:translateY(4px)} 100%{transform:translateY(-4px)} }

/* ===== BATS ===== */
.bat-wrap{ position:absolute; animation: flyAcross linear infinite; filter:drop-shadow(0 2px 2px rgba(0,0,0,.25)); }
@keyframes flyAcross{ to{ transform: translateX(145vw); } }
.bat{ width:90px; height:45px; color:#101010; overflow:visible; }
.wing{ transform-origin: 100px 48px; }
.bat-root .wing-left { animation: wingFlap 760ms ease-in-out infinite alternate; }
.bat-root .wing-right{ animation: wingFlap 760ms ease-in-out infinite alternate-reverse; }
@keyframes wingFlap{ 0%{ transform: rotate(-12deg) } 100%{ transform: rotate(10deg) } }

/* ===== BOTTOM DECOR (CLICKABLE) ===== */
.decor-img {
  width: 70px;
  height: auto;
  object-fit: contain;
  position: absolute;
  transform-origin: bottom center;
  cursor: pointer;
  transition: transform 0.3s ease;
  animation: floaty 6s ease-in-out infinite;
}
/* เด้งเมื่อคลิก (override แอนิเมชันช่วงสั้น ๆ) */
.decor-img.is-bouncing {
  animation: decorBounce 0.6s cubic-bezier(.28,.84,.42,1);
}
@keyframes floaty {
  0%,100% { transform: translateX(-50%) rotate(var(--rot,0)) translateY(0) scale(1); }
  50%     { transform: translateX(-50%) rotate(var(--rot,0)) translateY(-6px) scale(1.02); }
}
@keyframes decorBounce {
  0%   { transform: translateX(-50%) translateY(0)      scale(1);    }
  30%  { transform: translateX(-50%) translateY(-25px)  scale(1.1);  }
  60%  { transform: translateX(-50%) translateY(-10px)  scale(0.97); }
  100% { transform: translateX(-50%) translateY(0)      scale(1);    }
}

/* ACCESSIBILITY */
@media (prefers-reduced-motion: reduce){
  .bat-root .wing-left, .bat-root .wing-right, .bat-wrap, .fog-layer, .moon-glow, .moon-wrap { animation:none !important; }
}

.header-card {
  opacity: 0.8 !important;
}

.v-data-table {
  background-color: rgba(220, 220, 220, 0.8) !important;
}
</style>
