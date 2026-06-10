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
                <div class="modal-sec"><span class="mdi mdi-card-account-details-outline"></span> {{ $t('addFamily.title') }}</div>
                <div class="form-grid-3">
                    <div class="field"><label>{{ $t('addFamily.firstname') }} <span class="req">*</span></label>
                        <input class="id-input" v-model="firstname"></div>
                    <div class="field"><label>{{ $t('addFamily.middlename') }}</label>
                        <input class="id-input" v-model="middlename"></div>
                    <div class="field"><label>{{ $t('addFamily.lastname') }} <span class="req">*</span></label>
                        <input class="id-input" v-model="lastname"></div>
                </div>
                <div class="form-grid-3" style="margin-top:14px">
                    <div class="field"><label>{{ $t('addFamily.nickname') }} <span class="req">*</span></label>
                        <input class="id-input" v-model="nickname"></div>
                    <div class="field"><label>{{ $t('addFamily.gender') }} <span class="req">*</span></label>
                        <id-select v-model="gender" placeholder="— เลือก —"
                            :options="[{ value: 'ชาย', label: $t('common.male') }, { value: 'หญิง', label: $t('common.female') }]"></id-select></div>
                    <div class="field"><label>{{ $t('addFamily.dob') }} <span class="req">*</span></label>
                        <id-date v-model="dateofbirth" placeholder="เลือกวันเกิด"></id-date></div>
                </div>
                <div class="form-grid" style="margin-top:14px">
                    <div class="field full"><label>{{ $t('addFamily.school') }}</label>
                        <input class="id-input" v-model="school"></div>
                </div>

                <div class="af-actions">
                    <button type="button" class="id-btn id-btn-primary"
                        :disabled="!firstname || !lastname || !nickname || !gender || !dateofbirth" @click="doSave">
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
import moment from 'moment'
import { mapGetters } from 'vuex';
import { t } from '@/i18n';

export default {
    data: () => ({
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
            // plain .id-input fields aren't Vuetify inputs, so v-form.reset() can't
            // clear them — clear the bound data directly
            this.firstname = ''
            this.middlename = ''
            this.lastname = ''
            this.nickname = ''
            this.school = ''
            this.gender = ''
            this.dateofbirth = null
            if (this.$refs.form) this.$refs.form.resetValidation()
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