<template>
  <div v-if="isAuthenticated">
    <Transition name="fade">
      <div v-if="state=='family'">
        <Family
        @onClickChangeState="changeStateToReserveation($event)"
        @onClickBack="initBlackButton($event)"
        @onErrorHandler="onError($event)"
        @onInfoHandler="onShowInfoDialog($event)"
        :person="personSelected"
        ></Family>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-if="state=='reservation'">
        <Reservation 
        @onClickChangeState="changeStateToHome($event)"
        :person="personSelected"
        ></Reservation>
      </div>
    </Transition>
  </div>
  <div v-else>
    <div class="container">
      <img src="../assets/logo/logo-2.png" alt="iStar Logo" class="istar-logo">
      <p>Please log in to access this page.</p>
    </div>
  </div>
</template>
  
<script>
import Family from '@/components/Family.vue'
import Reservation from '@/components/Reservation.vue'
import { ref, computed, onMounted, inject } from 'vue';

export default {
  components: {
    Family,
    Reservation
  },
  data() {
    return {
      state: 'family',
      expand: true,
      expand2: false,
      personSelected: null,
    }
  },
  methods: {
    changeStateToReserveation(person) {
      this.state = 'reservation'
      this.expand = false
      this.expand2 = true
      this.personSelected = person
    },
    changeStateToHome(person) {
      this.state = 'family'
      this.expand2 = false
      this.expand = true
      this.personSelected = person
    },
    initBlackButton(state) {
      this.$emit('onClickBack', state)
    },
    onError(message) {
      this.$emit('onErrorHandler', message)
    }
  },
  setup() {
    const isAuthenticated = computed(() => !!localStorage.getItem('token'));
    console.log(isAuthenticated.value)

    return { isAuthenticated };
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>