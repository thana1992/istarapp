<!-- LoadingDialog.vue -->
<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-dialog">
      <!-- <trinity-rings-spinner
            :animation-duration="1500"
            :size="66"
            color="#ff1d5e"
            class="mx-auto"
        /> -->
      <half-circle-spinner :animation-duration="1000" :size="80" color="#ff1d5e" />
      <br>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script>
import { TrinityRingsSpinner, HollowDotsSpinner, CirclesToRhombusesSpinner, LoopingRhombusesSpinner, FlowerSpinner, OrbitSpinner, HalfCircleSpinner } from 'epic-spinners'
export default {
  components: {
    TrinityRingsSpinner,
    HollowDotsSpinner,
    CirclesToRhombusesSpinner,
    LoopingRhombusesSpinner,
    FlowerSpinner,
    OrbitSpinner,
    HalfCircleSpinner
  },
  props: {
    isLoading: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
}

.loading-dialog {
  padding: 25px;
  border-radius: 20px;
  text-align: center;
}
</style>