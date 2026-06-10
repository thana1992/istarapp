<!-- ============================================================
  GymnastManagement.vue — NEW DESIGN reskin (single iStar theme)
  Drop-in replacement for src/components/admin/GymnastManagement.vue
  • <template> + <script> = UNCHANGED from the original (logic + all API
    calls kept byte-for-byte). A new-design <style scoped> override block
    is appended at the end to adopt the iStar look.
  • Requires global: src/assets/istar-design.css  (+ Vuetify theme primary=#ec4899)
============================================================ -->
<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-gymnastics"></span> {{ $t('gymnasts.title') }}</h1>
        </div>
        <div class="container-content card-opacity">
            <Student @onErrorHandler="onErrorHandler" @onInfoHandler="onShowInfoDialog" @onLoading="onLoading($event)">
            </Student>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import Student from '../center/Student.vue';
import { mapGetters } from 'vuex';

export default {
    components: {
        DatePicker,
        Student,
    },
    data() {
        return {
        }
    },
    async created() {
        try {
            const token = this.$store.getters.getToken;
            //console.log('token ', token)
            if (!token) {
                this.errorMsg = 'Not found token, Please login...'
                this.errorDialog = true
                this.$emit('onClickChangeState', 'login')
                return;
            }

            await axios
                .post(this.baseURL + '/verifyToken', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        //this.initialize()
                    }
                })
                .catch(error => {
                    //console.error(error);
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                });
        } catch (error) {
            this.$emit('onErrorHandler', error.message)
        }

    },
    methods: {
        onShowInfoDialog(msg) {
            this.$emit('onInfoHandler', msg)
        },
        onErrorHandler(msg) {
            this.$emit('onErrorHandler', msg)
        },
        onLoading(isLoading) {
            this.$emit('onLoading', isLoading)
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
    }
}

</script>
<style scoped>
.info-photo {
    width: 150px;
    height: 150px;
    border-radius: 100%;
    display: flex;
    justify-content: center;
}

.center {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
```

<style scoped>
/* ============================================================
   iStar NEW DESIGN reskin (single theme) — layered overrides.
   Appended on top of the original styles so layout is preserved
   while colours / radius / shadow / fonts adopt the new design.
   Pulls tokens from the global src/assets/istar-design.css.
   ============================================================ */
:deep(.v-card){ border-radius: var(--radius-lg) !important; box-shadow: var(--shadow-sm) !important; border: 1px solid var(--c-border) !important; }
:deep(.v-btn){ border-radius: var(--radius-md) !important; text-transform: none !important; letter-spacing: normal !important; font-weight: 700 !important; }
:deep(.v-btn.bg-primary), :deep(.v-btn--variant-elevated){ box-shadow: var(--shadow-sm) !important; }
:deep(.v-field){ border-radius: 14px !important; }
:deep(.v-field--variant-solo-filled){ background: var(--c-surface-2) !important; box-shadow: none !important; }
:deep(.v-toolbar){ background: transparent !important; }
:deep(.v-toolbar-title){ font-family: var(--font-head) !important; font-weight: 800 !important; color: var(--c-text-heading) !important; }
:deep(.v-table){ background: transparent !important; }
:deep(.v-table > .v-table__wrapper > table > thead > tr > th){ background: var(--c-surface-2) !important; color: var(--c-text-heading) !important; font-family: var(--font-head) !important; font-weight: 700 !important; border-bottom: 2px solid var(--c-border) !important; }
:deep(.v-table > .v-table__wrapper > table > tbody > tr > td){ border-bottom: 1px solid var(--c-border) !important; }
:deep(.v-table > .v-table__wrapper > table > tbody > tr:hover > td){ background: var(--c-surface-3) !important; }
:deep(.v-chip){ font-weight: 600; }
:deep(.v-tab){ text-transform: none !important; font-weight: 700 !important; }
:deep(.v-list){ background: transparent !important; }
:deep(.group-header){ font-family: var(--font-head) !important; font-weight: 700 !important; color: var(--c-text-heading) !important; }
</style>
