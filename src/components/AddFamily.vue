<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-face-man-shimmer"></span> {{ $t('addFamily.title') }}</h1>
        </div>
        <div class="container-content">
            <v-card class="card-opacity mx-auto mt-4 px-6 py-6">
                <v-form ref="form">
                    <v-text-field variant="solo-filled" v-model="firstname" :label="$t('addFamily.firstname')" type="text"
                        :rules="requireRules" required></v-text-field>

                    <v-text-field variant="solo-filled" v-model="middlename" :label="$t('addFamily.middlename')"
                        type="text"></v-text-field>

                    <v-text-field variant="solo-filled" v-model="lastname" :label="$t('addFamily.lastname')" type="text"
                        :rules="requireRules" required></v-text-field>

                    <v-text-field variant="solo-filled" v-model="nickname" :label="$t('addFamily.nickname')" type="text"
                        :rules="requireRules" required></v-text-field>

                    <v-text-field variant="solo-filled" v-model="school" :label="$t('addFamily.school')"
                        type="text"></v-text-field>

                    <v-select v-model="gender" :label="$t('addFamily.gender')" :items="['ชาย', 'หญิง']" variant="solo-filled"
                    :rules="requireRules" required></v-select>

                    <DatePicker :label="$t('addFamily.dob')" v-model="dateofbirth" :maxdate="new Date()" :rules="requireRules">
                    </DatePicker>

                    <v-btn color="success" class="mt-6" block @click="doSave">
                        {{ $t('addFamily.submit') }}
                    </v-btn>
                    <v-btn color="pink" class="mt-3" block @click="reset">
                        {{ $t('addFamily.clear') }}
                    </v-btn>
                </v-form>
            </v-card>
        </div>
    </div>
</template>

<script>
import { VBottomNavigation, VBottomSheet } from 'vuetify/lib/components/index.mjs'
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import moment from 'moment'
import { mapGetters } from 'vuex';

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
            v => !!v || 'field is required',
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
            const { valid } = await this.$refs.form.validate()
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
                return moment(String(value)).format('YYYYMMDD')
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
                .then(response => {
                    //console.dir(response);
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
<style scoped></style>