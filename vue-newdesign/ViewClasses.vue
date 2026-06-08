<!-- ============================================================
  ViewClasses.vue — NEW DESIGN reskin (single iStar theme)
  Drop-in replacement for src/components/ViewClasses.vue
  • <template> + <script> = UNCHANGED from the original (logic + all API
    calls kept byte-for-byte). A new-design <style scoped> override block
    is appended at the end to adopt the iStar look.
  • Requires global: src/assets/istar-design.css  (+ Vuetify theme primary=#ec4899)
============================================================ -->
<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-table-eye"></span> {{ $t('viewClasses.title') }}</h1>
        </div>
        <div class="container-content">
            <div class="mx-auto mt-4">
                <v-row>
                    <v-col cols="12" sm="12" md="4" xl="3">
                        <v-card class="mx-0 card-opacity viewclasses-card" height="540">
                            <div class="istar-deco-stars">
                                <span class="mdi mdi-star-four-points deco-star-side"></span>
                                <span class="mdi mdi-star-shooting deco-star-main"></span>
                                <span class="mdi mdi-star-four-points deco-star-side"></span>
                            </div>
                            <v-list-item class="header-card">
                                <v-card-title class="text-center">{{ $t('viewClasses.viewByDate') }}</v-card-title>
                            </v-list-item>
                            <v-container>
                                <v-row justify="space-around">
                                    <v-date-picker class="datepick" v-model="datepick"
                                        @update:model-value="selectDate"></v-date-picker>
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="12" md="8" xl="9">
                        <BookingList @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                            @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                            @onLoading="onLoading($event)" :bookingHeaders="bookingHeaders" :bookingData="bookingList"
                            :classdate="datepick" :loadingBooking="loadingBooking">
                        </BookingList>
                    </v-col>
                </v-row>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import BookingList from '@/components/center/BookingList.vue'
import moment from 'moment'
import { mapGetters } from 'vuex';
export default ({
    components: {
        BookingList,
    },
    data() {
        return {
            fetchData: null,
            errorDialog: false,
            errorMsg: '',
            infoDialog: false,
            infoMsg: '',
            interval: null,
            datepick: new Date(),
            bookingList: [],
            bookingHeaders: [],
            loadingBooking: false,
            state: 'bookinglist',
        }
    },
    async created() {
        this.datepick = new Date();
        this.$emit('onLoading', true)
        await this.initialize()
        this.$emit('onLoading', false)
    },
    methods: {
        async initialize() {
            await this.getBookingList()
        },
        refreshData() {
            //console.log('refreshData : ' + new Date())
            if (this.state == "bookinglist") {
                this.getBookingList()
            }
        },
        selectDate() {
            this.state = 'bookinglist'
            this.getBookingList()
        },
        async getBookingList() {
            // Call the API and set the bookingList object
            this.loadingBooking = true
            try {
                const classdate = this.SQLDate(this.datepick);
                //console.log("datepick : "+classdate)
                const classday = new Date(this.datepick).toLocaleDateString('en-US', { weekday: 'long' });
                //console.log('fetchDataBooking parameters ' + classday + ' ' + this.SQLDate(this.datepick))
                const token = this.$store.state.token;
                await DashboardAPI.fetchDataBooking({ token, classday, classdate })
                    .then(({ success, results, message }) => {
                        //console.log('fetchDataBooking result',success, results, message);
                        if (success) {
                            if (results) {
                                this.bookingHeaders = Object.keys(results).map((key) => ({ title: key, key: key, sortable: false, align: "right"}));
                                this.bookingHeaders.unshift({ title: 'No.', key: 'idx', sortable: false, align: "right"  })
                                this.bookingList = this.formattedData(results)
                            } else {
                                this.bookingHeaders = []
                                this.bookingList = []
                            }
                        } else {
                            this.bookingHeaders = []
                            this.bookingList = []
                            this.$emit('onErrorHandler', message || this.$t('msg.loadFail'))
                        }
                        if (classdate == this.SQLDate(this.datepick)) {
                            this.loadingBooking = false
                        }

                    })
                    .catch(error => {
                        //console.log('error : ', error)
                        this.loadingBooking = false
                        if (error.response.status == 401) {
                            this.$emit('onErrorHandler', error.response.data.message)
                            this.$emit('onClickChangeState', 'login')
                        } else {
                            this.$emit('onErrorHandler', error.message)
                        }
                    });

            } catch (error) {
                //console.log('error : ', error)
                this.$emit('onErrorHandler', error.message)
            }
        },
        onError(msg) {
            this.$emit('onErrorHandler', msg)
        },
        onShowInfoDialog(msg) {
            this.infoMsg = msg
            this.infoDialog = true
        },
        onLoading(isLoading) {
            this.$emit('onLoading', isLoading)
        },
        SQLDate(date) {
            return moment(date).format('YYYY-MM-DD')
        },
        formattedData(results) {
            // Transform the bookingData object into an array of objects
            const timeClass = Object.keys(results);
            // Create an array with an empty object for each time slot
            const rows = Array.from({ length: Math.max(...timeClass.map(slot => results[slot].length)) }, () => ({}));

            // Populate each column with data based on the time slot
            timeClass.forEach((ts) => {
                results[ts].forEach((student, index) => {
                    rows[index][ts] = student;
                });
            });

            const formattedRows = rows.map((row, index) => ({
                idx: index + 1, // Adding 1 to start from 1 instead of 0
                ...row
            }));

            //console.log('formattedData : ' + JSON.stringify(formattedRows))
            return formattedRows;
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        })

    }
})
import { Promise } from 'core-js';
const DashboardAPI = {
    baseURL: env.SERVER_URL,
    fetchDataBooking({ token, classday, classdate }) {
        return new Promise(resolve => {
            //console.log('DashboardAPI : ' + this.baseURL + '/getBookingList' + ' classday : ' + classday + ' classdate : ' + classdate)
            axios
                .post(this.baseURL + '/getBookingList', {
                    classday: classday,
                    classdate: classdate
                },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    })
                .then(response => {
                    //console.log('fetchDataBooking result',response);
                    if (response.data.success) {
                        resolve({ success: true, results: response.data.bookinglist, message: response.data.message })
                    } else {
                        resolve({ success: false, results: null, message: response.data.message })
                    }
                })
                .catch(error => {
                    resolve({ success: false, error: error })
                });
        });
    },
}
</script>
<style scoped>
.font-card {
    font-size: 20px;
    font-weight: bold;
}

button span.mdi,
.dashboard-card span.mdi {
    font-size: 22px;
    margin-right: 5px;
}

.dashboard-card:hover {
    background-color: rgba(187, 187, 187, 0.342);
    cursor: pointer;
}

/* Neumorphic date picker blending */
:deep(.v-date-picker) {
    background: transparent !important;
}

:deep(.v-date-picker__header) {
    background: transparent !important;
}

:deep(.v-date-picker-controls) {
    background: transparent !important;
}

:deep(.v-date-picker-month) {
    background: transparent !important;
}

:deep(.datepick) {
    background: transparent !important;
}
</style>

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
