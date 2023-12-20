<template>
  <Transition name="fade">
    <div v-if="state=='family'">
      <Family
      @onClickChangeState="changeStateToReserveation($event)"
      @onClickBack="initBlackButton($event)"
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
</template>
  
<script>
import Family from '@/components/Family.vue'
import Reservation from '@/components/Reservation.vue'

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
    }
  }
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