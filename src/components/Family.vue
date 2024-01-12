<template>
        

    <div>
        <div class="container-header">
            <h1><font-awesome-icon icon="fa-solid fa-house-user" /> Home</h1>
        </div>
        <div class="container-content">
            <h3 class="group-header">Family</h3>
            <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            <v-table class="family-list">
                <tbody>
                <tr
                    v-for="item in userdetail"
                    :key="item.name"
                    style="cursor: pointer;"
                    class="tr-rows"
                    @click="selectChild(item)"
                >
                    <td>
                        <v-img
                            :src="item.photo"
                            cover
                            class="pa-4 bg-secondary rounded-circle d-inline-block"
                            style="display: flex !important;"
                        ></v-img>
                    </td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.course_type }}</td>
                </tr>
                </tbody>
            </v-table>
        </div>
            <div class="container-content">
                <h3 class="group-header">Information</h3>
                <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
                <div class="information">
                    <Transition v-for="item in userdetail">
                        <div v-if="userdetail.indexOf(item)==showidx">
                            <div class="info-photo" >
                                <v-img
                                    :src="item.photo"
                                    cover
                                    class="pa-6 bg-secondary rounded-circle d-inline-block"
                                    style="display: flex !important; max-width: 25vw;"
                                ></v-img>   
                            </div>
                            <div class="info-detail">
                                <p>{{ item.name }} ({{ item.nickname }})</p>
                                <p>เพศ {{ item.gender }} อายุ {{ item.age }} ปี</p>
                                <p>Course {{ item.course_type }} </p>
                                <p>เหลือ {{ item.course_remaining }} ครั้ง</p>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        <Transition>
            <div class="container-content">
                <h3 class="group-header">Reservation 
                    <span class="mdi mdi-calendar-plus btn-reserve" @click="doReservation"></span>
                </h3>
                <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
                
                <Transition v-for="item in userdetail">
                    <!-- <div v-if="showid==item.id">
                        <v-data-table-virtual
                            :headers="headers"
                            :items="item.reservation"
                            item-value="name"
                            height="300"
                        />
                    </div> -->
                    <v-table v-if="userdetail.indexOf(item)==showidx" class="family-list">
                        <thead>
                            <tr>
                                <th class="text-left">No.</th>
                                <th class="text-left">Date</th>
                                <th class="text-left">Class Time</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            <tr
                                v-for="item in item.reservation"
                                :key="item.no"
                                class="tr-rows"
                            >
                                <td>{{ item.no }}</td>
                                <td>{{ item.classdate }}</td>
                                <td>{{ item.classtime }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </Transition>
            </div>
        </Transition>
    </div>
    
</template>

<script>
import { VBottomNavigation, VBottomSheet } from 'vuetify/lib/components/index.mjs'
import { ref, computed, onMounted, inject } from 'vue';
import Reservations from './Reservation.vue'

export default {
    setup() {
        const isAuthenticated = computed(() => !!localStorage.getItem('token'));
        console.log(isAuthenticated.value)

        return { isAuthenticated };
    },
    components: {
        VBottomNavigation,
        VBottomSheet,
        Reservations
    },
    methods: {
        selectChild(person) {
            console.log(this.userdetail.indexOf(person))
            this.showidx = this.userdetail.indexOf(person)
            this.personSelected = person
        },
        doReservation() {
            //this.$router.push({ name:'reservation', params: { people: { name:this.info_name }} })
            //this.clickReservation = true;
            if(this.personSelected == null) {
                alert('Please select any one of your family')
                return
            }
            
            this.$emit('onClickChangeState', this.personSelected)
            this.$emit('onClickBack', 'family')
        },
        async getUserFamily() {
            const $http = inject('$http', null);
            try {
            if (!$http) {
                console.error('Axios instance not found. Make sure it is provided in main.js.');
                this.$emit("onErrorHandler", "Client Error")
                return;
            }
            const token = localStorage.getItem('token');
            console.log('getUserFamily Token : ', token);
            if(token == null) {
                this.$emit("onErrorHandler", "invalid token please login again")
            }
            
            const requestOptions = {
                method: 'GET',
                headers: { 'Authorization': token },
            };


            const response = await $http.post('/getUser', null, requestOptions);
            console.log(response.data.user)
            console.log("getUserFamily : " , response.data.user.family);
            this.userdetail = response.data.user.family;
            } catch (error) {
                console.error('Error fetching user data:', error);
                this.$emit("onErrorHandler", error.message)
            }
        }
    },
    props: {
        person: {
            type: Object,
            default: null,
        },
    },
    async created() {
        await this.getUserFamily()
        
        // if(this.person != null) {
        //     this.showidx = this.userdetail.indexOf(this.person)+1
        //     this.personSelected = this.person
        //     selectChild(this.userdetail[this.showidx])
        // }
        
    },
    data() {
        return {
            userdetail: null,
            personSelected: null,
            showidx: null,
            clickReservation: false,
            headers: [
                { title: 'No.', align:'start', key: 'no' },
                { title: 'Date', align:'start', key: 'classdate' },
                { title: 'Class Time', align:'start', key: 'classtime' },
            ],
            // family: [
            //     {
            //         id: 1,
            //         photo: 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/boy_person_avatar_kid-512.png',
            //         name: 'มณัญฌญา จันทราพรไพลิน',
            //         nickname: 'ไอซ์',
            //         gender: 'หญิง',
            //         age: '10',
            //         course_type: 'iStar',
            //         course_remaining: 1,
            //         reservation: [
            //             {
            //                 no: 1,
            //                 classdate: '2023-12-21',
            //                 classtime: '10:00-11:30',
            //             }
            //         ]
            //     },
            //     {
            //         id: 2,
            //         photo: 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/boy_person_avatar_kid-512.png',
            //         name: 'ธนา ผโลดม',
            //         nickname: 'บุช',
            //         gender: 'ชาย',
            //         age: '12',
            //         course_type: 'G.A.',
            //         course_remaining: 2,
            //         reservation: [
            //             {
            //                 no: 1,
            //                 classdate: '2023-12-22',
            //                 classtime: '10:00-11:30',
            //             },
            //             {
            //                 no: 2,
            //                 classdate: '2023-12-23',
            //                 classtime: '10:00-11:30',
            //             }
            //         ]
            //     },
            //     {
            //         id: 3,
            //         photo: 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_native_boy_kid-512.png',
            //         name: 'ธนภรณ์ อุทัยศรี',
            //         nickname: 'อีฟ',
            //         gender: 'หญิง',
            //         age: '11',
            //         course_type: 'G.A.',
            //         course_remaining: 3,
            //         reservation: [
            //             {
            //                 no: 1,
            //                 classdate: '2024-01-03',
            //                 classtime: '09:00-10:30',
            //             },
            //             {
            //                 no: 2,
            //                 classdate: '2024-01-04',
            //                 classtime: '14:00-15:30',
            //             },
            //             {
            //                 no: 3,
            //                 classdate: '2024-01-05',
            //                 classtime: '09:00-10:30',
            //             },
            //             {
            //                 no: 4,
            //                 classdate: '2024-01-06',
            //                 classtime: '09:00-10:30',
            //             },
            //             {
            //                 no: 5,
            //                 classdate: '2024-01-07',
            //                 classtime: '14:00-15:30',
            //             },
            //             {
            //                 no: 6,
            //                 classdate: '2024-01-08',
            //                 classtime: '09:00-10:30',
            //             },
            //             {
            //                 no: 7,
            //                 classdate: '2024-01-09',
            //                 classtime: '09:00-10:30',
            //             },
            //             {
            //                 no: 8,
            //                 classdate: '2024-01-10',
            //                 classtime: '14:00-15:30',
            //             },
            //             {
            //                 no: 9,
            //                 classdate: '2024-01-11',
            //                 classtime: '09:00-10:30',
            //             },
            //             {
            //                 no: 10,
            //                 classdate: '2024-01-13',
            //                 classtime: '09:00-10:30',
            //             },
            //             {
            //                 no: 11,
            //                 classdate: '2024-01-14',
            //                 classtime: '14:00-15:30',
            //             },
            //             {
            //                 no: 12,
            //                 classdate: '2024-01-15',
            //                 classtime: '09:00-10:30',
            //             }
            //         ]
            //     },
            // ],
        };
    },
}
</script>
<style scoped>
.group-header {
    font-size: 16px;
    font-weight: bold;
}
.tr-rows:active {
    background-color: #f5f5f5;
}
.family-list {
    font-size:  3.1vw;
}
.info-photo {
    padding-top: 5%;
    padding-left: 30%;
    padding-right: 30%;
    width: 100%;
    display: flex;
    justify-content: center;
}
.information {
    min-height: 30vh;
}
.info-detail {
    padding-top: 5%;
    text-align: center;
    width: 100%;
}
.btn-reserve {
    float: right;
    box-shadow: 0 0 0 0;
    margin-bottom: 2vh;
    height: 25px;
    font-size: larger;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 1.6s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transition: opacity 0s ease;
}
</style>