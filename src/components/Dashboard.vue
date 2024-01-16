<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-view-dashboard"></span> Dashboard</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            <div class="mx-auto mt-5 px-2 py-1">
                <v-row>
                    <v-col cols="12" sm="6" md="3" xl="3">
                        <v-card class="mx-auto" link>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-content>
                                    <div class="overline mb-4">Total Students</div>
                                    <v-list-item-title class="headline mb-1">{{ totalStudents }}</v-list-item-title>
                                    <v-list-item-subtitle>Students</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-avatar color="grey" size="80">
                                    <span class="mdi mdi-account-group"></span>
                                </v-list-item-avatar>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" xl="3">
                        <v-card class="mx-auto" link @click="onClickCardToday">
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-content>
                                    <div class="overline mb-4">Total bookings today</div>
                                    <v-list-item-title class="headline mb-1">{{ totalBookingToday }}</v-list-item-title>
                                    <v-list-item-subtitle>Students</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-avatar color="grey" size="80">
                                    <span class="mdi mdi-account-group"></span>
                                </v-list-item-avatar>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" xl="3">
                        <v-card class="mx-auto" link>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-content>
                                    <div class="overline mb-4">Approve new students</div>
                                    <v-list-item-title class="headline mb-1">{{ totalWaitNewStudents }}</v-list-item-title>
                                    <v-list-item-subtitle>Students</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-avatar color="grey" size="80">
                                    <span class="mdi mdi-account-group"></span>
                                </v-list-item-avatar>
                            </v-list-item>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" xl="3">
                        <v-card class="mx-auto" link>
                            <v-list-item three-line class="dashboard-card">
                                <v-list-item-content>
                                    <div class="overline mb-4">Approve cancel booking class</div>
                                    <v-list-item-title class="headline mb-1">{{ totalWaitCancelBooking }}</v-list-item-title>
                                    <v-list-item-subtitle>Students</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-avatar color="grey" size="80">
                                    <span class="mdi mdi-account-group"></span>
                                </v-list-item-avatar>
                            </v-list-item>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="6" md="4" xl="3">
                        <v-card class="mx-0" height="400">
                            <v-container>
                                <v-row justify="space-around">
                            <v-date-picker
                                v-model="date"
                                @click="selectDate"
                            ></v-date-picker>
                        </v-row>
                            </v-container>
                        </v-card>
                    </v-col>
                    <v-col cols="12" sm="6" md="8" xl="9">
                        <v-card class="mx-0">
                            <v-data-table
                                :loading="loading"
                                :headers="headers"
                                :items="BookingList"
                                :sort-by="[{ key: 'classtime', order: 'asc' }]"
                                >
                                <template v-slot:top>
                                    <v-toolbar
                                    flat
                                    >
                                    <v-toolbar-title>All class bookings today</v-toolbar-title>
                                    <v-dialog v-model="dialogDelete" persistent width="auto">
                                        <v-card>
                                            <v-card-title></v-card-title>
                                            <v-card-text>ลบแน่นะอีฟ ?</v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="#4CAF50" variant="tonal" @click="deleteItemConfirm">ใช่! ลบเลย</v-btn>
                                            <v-btn color="#F44336" variant="tonal" @click="closeDelete">ไม่ลบละ เปลี่ยนใจ</v-btn>
                                            
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                        </v-card>
                                    </v-dialog>
                                    </v-toolbar>
                                </template>
                                <template v-slot:item.checkin="{ item }">
                                    <v-icon
                                    size="large"
                                    class="me-2"
                                    @click="checkin(item)"
                                    >
                                    mdi-check-bold
                                    </v-icon>
                                </template>
                                <template v-slot:loading>
                                    <v-skeleton-loader type="table-row@5"></v-skeleton-loader>
                                </template>
                                <template v-slot:item.delete="{ item }">
                                    <v-icon
                                    size="small"
                                    @click="deleteItem(item)"
                                    >
                                    mdi-delete
                                    </v-icon>
                                </template>
                                <template v-slot:no-data>
                                    No booking class
                                </template>
                                </v-data-table>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                </v-row>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import moment from 'moment'
export default ({
    data() {
        return {
            date: new Date(),
            tomorrow: new Date(),
            totalStudents: 0,
            totalBookingToday: 0,
            totalWaitNewStudents: 0,
            totalWaitCancelBooking: 0,
            BookingList: [],
            headers: [
            { title: 'Name', key: 'fullname' },
            { title: 'Class Time', key: 'classtime' },
            { title: 'Class', key: 'coursename' },
            { title: 'Check-in', key: 'checkin', align: 'center', sortable: false },
            { title: 'Delete', key: 'delete', align: 'center', sortable: false },
            ],
            editedIndex: -1,
            dialog: false,
            dialogDelete: false,
            loading: false,
        }
    },
    setup() {
        return {
            editedItem: {
                coursename: '',
                course_shortname: ''
            }
        }
    },
    created() {
        this.getTotalStudents()
        this.getTotalReservationToday()
        this.getReservationList()
        //this.getApproveNewStudents()
        //this.getApproveCancelBookingClass()
    },
    methods: {
        selectDate() {
            console.log(this.SQLDate(this.date))
            this.getReservationList()
        },
        onClickCardToday() {
            this.date = new Date()
            this.selectDate()
        },
        getTotalStudents() {
            axios
            .get('http://localhost:3000/getTotalStudents', {})
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.totalStudents = response.data.results[0].total
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        getTotalReservationToday() {
            axios
            .get('http://localhost:3000/getTotalReservationToday', {})
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.totalBookingToday = response.data.results[0].total
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        async getReservationList() {
            this.loading = true
            setTimeout(() => {
            axios
            .post('http://localhost:3000/getReservationList', { classdate: this.SQLDate(this.date) })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.BookingList = response.data.results
                } else {
                    this.BookingList = []
                }
            })
            .catch(error => {
                console.error(error);
            });
            this.loading = false
            }, 3000)
            
        },
        getApproveNewStudents() {
            axios
            .get('http://localhost:3000/getApproveNewStudents', {})
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.courselist = response.data.results
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        getApproveCancelBookingClass() {
            axios
            .get('http://localhost:3000/getApproveCancelBookingClass', {})
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.courselist = response.data.results
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        editItem (item) {
          this.editedIndex = this.BookingList.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialog = true
        },
        deleteItem (item) {
          this.editedIndex = this.BookingList.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialogDelete = true
        },
        closeDelete () {
          this.dialogDelete = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },
        SQLDate(date) {
            return moment(date).format('YYYY-MM-DD')
        },
        format_date(value){
            if (value) {
                return moment(String(value)).format('DD/MM/YYYY')
            }
        },
    },
    watch: {
        dialogDelete (val) {
          val || this.closeDelete()
        },
      },

})
</script>
<style scoped>
.dashboard-card:hover {
    background-color: rgba(187, 187, 187, 0.342);
    cursor: pointer;
}
</style>

