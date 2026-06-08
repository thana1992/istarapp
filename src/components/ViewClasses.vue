<template>
    <div>
        <div class="pg-head">
            <div class="pg-ico"><span class="mdi mdi-table-eye"></span></div>
            <div>
                <div class="id-h1">{{ $t('viewClasses.title') }}</div>
                <div class="pg-sub">{{ $t('viewClasses.viewByDate') }}</div>
            </div>
        </div>

        <div class="grid2 grid2-booking">
            <div class="scard" style="padding:16px;align-self:start;max-width:340px;width:100%">
                <div class="step-head"><span class="mdi mdi-calendar-month-outline" style="color:var(--c-primary);font-size:22px"></span> {{ $t('viewClasses.viewByDate') }}</div>
                <id-calendar
                    :model-value="datepick ? (datepick.getFullYear() + '-' + (datepick.getMonth() + 1) + '-' + datepick.getDate()) : ''"
                    @update:model-value="key => { const p = key.split('-'); datepick = new Date(+p[0], +p[1] - 1, +p[2]); selectDate(); }">
                </id-calendar>
            </div>
            <div>
                <BookingList @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                    @onClickChangeState="onClickChangeState($event)" @onUpdateDataSuccess="refreshData"
                    @onLoading="onLoading($event)" :bookingHeaders="bookingHeaders" :bookingData="bookingList"
                    :classdate="datepick" :loadingBooking="loadingBooking">
                </BookingList>
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
/* Layout comes from global istar-pages.css (.pg-head, .grid2-booking, .scard,
   .step-head) and istar-design.css. The calendar is the global <id-calendar>
   styled by global .cal-* rules — no scoped overrides needed here. */
</style>