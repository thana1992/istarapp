<template>
  <v-menu v-model="isMenuOpen" :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-text-field 
        :label="label" 
        :model-value="formattedDate" 
        readonly 
        v-bind="props" 
        variant="solo-filled"
        hide-details 
        :required="required" 
        :rules="[v => !!v || 'Required']"
      >
        <template v-slot:append-inner>
          <v-icon 
            v-if="selectedDate" 
            @click.stop="clearDate" 
            class="clear-icon"
          >
            mdi-close-circle
          </v-icon>
        </template>
      </v-text-field>
    </template>
    <v-date-picker ref="picker" v-model="selectedDate" hide-actions title="" :color="color" :max="maxdate"
      :min="mindate" :required="required">
      <template v-slot:header></template>
    </v-date-picker>
  </v-menu>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import moment from "moment";

const { label, color, modelValue, mindate, maxdate, required } = defineProps([
  "label",
  "color",
  "modelValue",
  "mindate",
  "maxdate",
  "required"
]);

const emit = defineEmits("update:modelValue");

const isMenuOpen = ref(false);
const selectedDate = ref(modelValue);
const formattedDate = computed(() => {
  return selectedDate.value ? moment(String(selectedDate.value)).format('DD/MM/YYYY') : "";
});

const clearDate = () => {
  selectedDate.value = null;
  emit("update:modelValue", null);
};

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

/* เพิ่มสไตล์ hover สำหรับปุ่มกากบาท */
.clear-icon {
  color: grey;
  transition: color 0.3s ease;
}

.clear-icon:hover {
  color: red; /* เปลี่ยนสีเป็นสีแดงเมื่อ hover */
  cursor: pointer;
}
</style>
