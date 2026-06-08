<!-- ============================================================
  AddFamily.vue — NEW DESIGN 1:1 (iStar).
  • <script> = UNCHANGED (data/methods/refs/rules/API kept verbatim).
  • <template> rebuilt to the prototype form primitives: .pg-head
    (mdi-account-plus + existing title key) + .scard wrapping the
    existing <v-form ref="form"> with all v-text-field / v-select /
    DatePicker controls (v-model / :rules intact). Fields grouped in
    a .form-grid via .field wrappers. Save/clear become .id-btn,
    wired to the real doSave / reset methods.
  Requires global: src/assets/istar-design.css + istar-pages.css.
============================================================ -->
<template>
    <div>
        <div class="pg-head">
            <div class="pg-ico"><span class="mdi mdi-account-plus"></span></div>
            <div>
                <div class="id-h1">{{ $t('addFamily.title') }}</div>
            </div>
        </div>

        <div class="scard af-card">
            <v-form ref="form">
                <div class="form-grid">
                    <div class="field">
                        <v-text-field variant="solo-filled" v-model="firstname" :label="$t('addFamily.firstname')"
                            type="text" :rules="requireRules" required></v-text-field>
                    </div>
                    <div class="field">
                        <v-text-field variant="solo-filled" v-model="middlename" :label="$t('addFamily.middlename')"
                            type="text"></v-text-field>
                    </div>
                    <div class="field">
                        <v-text-field variant="solo-filled" v-model="lastname" :label="$t('addFamily.lastname')"
                            type="text" :rules="requireRules" required></v-text-field>
                    </div>
                    <div class="field">
                        <v-text-field variant="solo-filled" v-model="nickname" :label="$t('addFamily.nickname')"
                            type="text" :rules="requireRules" required></v-text-field>
                    </div>
                    <div class="field">
                        <v-text-field variant="solo-filled" v-model="school" :label="$t('addFamily.school')"
                            type="text"></v-text-field>
                    </div>
                    <div class="field">
                        <v-select v-model="gender" :label="$t('addFamily.gender')"
                            :items="[{ title: $t('common.male'), value: 'ชาย' }, { title: $t('common.female'), value: 'หญิง' }]"
                            variant="solo-filled" :rules="requireRules" required></v-select>
                    </div>
                    <div class="field full">
                        <DatePicker :label="$t('addFamily.dob')" v-model="dateofbirth" :maxdate="new Date()"
                            :rules="requireRules"></DatePicker>
                    </div>
                </div>

                <div class="af-actions">
                    <button type="button" class="id-btn id-btn-primary" @click="doSave">
                        <span class="mdi mdi-content-save"></span> {{ $t('addFamily.submit') }}
                    </button>
                    <button type="button" class="id-btn id-btn-soft" @click="reset">
                        <span class="mdi mdi-backspace-outline"></span> {{ $t('addFamily.clear') }}
                    </button>
                </div>
            </v-form>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import moment from 'moment'
import { mapGetters } from 'vuex';
import { t } from '@/i18n';

export default {
    components: {
        DatePicker,
    },
    data: () => ({
        date: null,
        firstname: '',
        middlename: '',
        lastname: '',
        nickname: '',
        gender: '',
        dateofbirth: null,
        school: '',
        format: 'dddd MMMM DD, YYYY',
        requireRules: [
            v => !!v || t('common.required'),
        ],
    }),
    methods: {
        async doSave() {
            this.$emit('onLoading', true)
            const { valid } = await this.$refs.form.validate()
            if(!valid) {
                this.$emit('onErrorHandler', this.$t('addFamily.errorRequired'))
                this.$emit('onLoading', false)
                return
            }
            if (valid) {

                const userdata = localStorage.getItem('userdata')
                const user = JSON.parse(userdata)
                const token = this.$store.getters.getToken;
                // Make API request to register the user
                await axios
                    .post(this.baseURL + '/addStudent', {
                        firstname: this.firstname,
                        middlename: this.middlename,
                        lastname: this.lastname,
                        nickname: this.nickname,
                        gender: this.gender,
                        dateofbirth: this.format_date(this.dateofbirth),
                        school: this.school,
                        familyid: user.familyid,
                    },
                        {
                            headers: { Authorization: `Bearer ${token}`, }
                        })
                    .then(response => {
                        //console.log(response)
                        if (response.data.success) {
                            this.$emit('onLoading', false)
                            this.$emit('onInfoHandler', response.data.message || this.$t('msg.familyAdded'));
                            this.$emit('onClickChangeState', 'familylist')
                        } else {
                            this.$emit('onErrorHandler', response.data.message || this.$t('msg.familyAddFail'));
                        }
                    })
                    .catch(error => {
                        //console.error(error);
                        if (error.response.status == 401) {
                            this.$emit('onErrorHandler', error.response.data.message)
                            this.$emit('onClickChangeState', 'login')
                        } else {
                            this.$emit('onErrorHandler', error.message)
                        }
                    });
            }

            this.$emit('onLoading', false)
        },
        async validate() {
            await this.$refs.form.validate()
            this.$emit('onClickChangeState', 'list')
        },
        reset() {
            this.$refs.form.reset()
        },
        resetValidation() {
            this.$refs.form.resetValidation()
        },
        format_date(value) {
            if (value) {
                return moment(value).format('YYYYMMDD')
            }
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
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
                .then(() => {
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
}
</script>
<style scoped>
.af-card {
    max-width: 760px;
    margin: 0 auto;
    padding: 24px;
}

/* let the Vuetify fields fill their grid cell */
.af-card .form-grid .field :deep(.v-input) {
    width: 100%;
}

.af-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 8px;
}

.af-actions .id-btn {
    flex: 1 1 180px;
}

@media (max-width: 620px) {
    .af-actions .id-btn {
        flex: 1 1 100%;
    }
}
</style>