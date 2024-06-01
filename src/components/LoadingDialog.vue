<!-- LoadingDialog.vue -->
<template>
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-dialog">
        <trinity-rings-spinner
            :animation-duration="1500"
            :size="66"
            color="#ff1d5e"
            class="mx-auto"
            />
        <p>Loading...</p>
      </div>
    </div>
  </template>
  
<script>
  import { TrinityRingsSpinner } from 'epic-spinners'
  export default {
    components: {
        TrinityRingsSpinner
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
    background: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
  }
  </style>
  