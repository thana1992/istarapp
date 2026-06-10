<!-- ============================================================
  IdModal.vue — the ONE standard dialog (replaces every <v-dialog>).
  Pink-gradient head (icon + title + subtitle + × close), scrollable
  body slot, optional right-aligned footer slot. ESC / scrim-click close;
  on mobile it docks to the bottom as a sheet. All styling is global
  (.id-modal* in istar-design.css) — no scoped CSS here.

  Props:
    modelValue Boolean  v-model open state
    title      String   head title
    subtitle   String   head subtitle (optional)
    icon       String   mdi class e.g. 'mdi-account-plus' (optional)
    size       String   sm(≤430) | md(≤560, default) | lg(≤760) | xl(≤980)
    noFooter   Boolean  hide the footer slot
    persistent Boolean  don't close on scrim-click / ESC (for forms mid-edit)
  Slots: default (body), footer
  Emits: update:modelValue, close
============================================================ -->
<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="id-modal-scrim" @mousedown.self="onScrim">
        <div class="id-modal" :class="size" role="dialog" aria-modal="true">
          <div class="id-modal-head">
            <div v-if="icon" class="id-modal-ico"><span class="mdi" :class="icon"></span></div>
            <div class="id-modal-titles">
              <div class="id-modal-title">{{ title }}</div>
              <div v-if="subtitle" class="id-modal-sub">{{ subtitle }}</div>
            </div>
            <button class="id-modal-x" @click="close" aria-label="ปิด"><span class="mdi mdi-close"></span></button>
          </div>
          <div class="id-modal-body"><slot></slot></div>
          <div v-if="!noFooter" class="id-modal-foot"><slot name="footer"></slot></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'IdModal',
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    size: { type: String, default: 'md' },
    noFooter: { type: Boolean, default: false },
    persistent: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'close'],
  methods: {
    close() { this.$emit('update:modelValue', false); this.$emit('close'); },
    onScrim() { if (!this.persistent) this.close(); },
    onKey(e) { if (e.key === 'Escape' && this.modelValue && !this.persistent) this.close(); },
  },
  watch: { modelValue(v) { document.body.style.overflow = v ? 'hidden' : ''; } },
  mounted() { document.addEventListener('keydown', this.onKey); },
  beforeUnmount() { document.removeEventListener('keydown', this.onKey); document.body.style.overflow = ''; },
};
</script>
