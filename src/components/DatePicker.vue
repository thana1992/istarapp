<template>
  <v-menu v-model="isMenuOpen" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-text-field :label="label" :model-value="formattedDate" readonly v-bind="props" variant="solo-filled"
        hide-details required></v-text-field>
    </template>
    <v-date-picker ref="picker" v-model="selectedDate" hide-actions title="" :color="color" :max="maxdate"
      :min="mindate">
      <template v-slot:header></template>
    </v-date-picker>
  </v-menu>
</template>
<script>
export default {
  data: () => ({
    srules: [
      v => !!v || 'Username is required',
    ],
  })
}  
</script>
<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import moment from "moment";
const { label, color, modelValue, mindate, maxdate } = defineProps([
  "label",
  "color",
  "modelValue",
  "mindate",
  "maxdate",
]);
const emit = defineEmits("update:modelValue");

const isMenuOpen = ref(false);
const selectedDate = ref(modelValue);
const formattedDate = computed(() => {
  return selectedDate.value ? moment(String(selectedDate.value)).format('DD/MM/YYYY') : "";
});

watch(modelValue, (newDate) => {
  selectedDate.value = newDate;
});

watch(selectedDate, (newDate) => {

  emit("update:modelValue", newDate);
  isMenuOpen.value = false;
});

</script>
<style>
.v-overlay__content:has(> .v-date-picker) {
  min-width: auto !important;
}

.v-picker-title {
  padding: 0 !important;
}
</style>