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
                    v-for="item in family"
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
                    <td>{{ item.course }}</td>
                </tr>
                </tbody>
            </v-table>
        </div>
            <div class="container-content">
                <h3 class="group-header">Information</h3>
                <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
                <div class="information">
                    <Transition v-for="item in family">
                        <div v-if="showid==item.id">
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
                                <p>Course {{ item.course }} เหลือ {{ item.remaining }} ครั้ง</p>
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
                
                <Transition v-for="item in family">
                    <!-- <div v-if="showid==item.id">
                        <v-data-table-virtual
                            :headers="headers"
                            :items="item.reservation"
                            item-value="name"
                            height="300"
                        />
                    </div> -->
                    <v-table v-if="showid==item.id" class="family-list">
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
import Reservations from './Reservation.vue'
export default {
    components: {
        VBottomNavigation,
        VBottomSheet,
        Reservations
    },
    methods: {
        selectChild(info) {
            this.showid = info.id
            this.personSelected = info
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
        }
    },
    computed: {
        virtualFamily(rows) {
            return [...Array(3).keys()].map(i => {
                const family = { ...this.family[i % this.family.length] };
                return family;
            });
        },
    },
    props: {
        person: {
            type: Object,
            default: null,
        },
    },
    created() {
        if(this.person != null) {
            this.showid = this.person.id
            this.personSelected = this.person
        }
    },
    data() {
        return {
            personSelected: null,
            showid: 0,
            clickReservation: false,
            headers: [
                { title: 'No.', align:'start', key: 'no' },
                { title: 'Date', align:'start', key: 'classdate' },
                { title: 'Class Time', align:'start', key: 'classtime' },
            ],
            reservation: [],

            family: [
                {
                    id: 1,
                    photo: 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/boy_person_avatar_kid-512.png',
                    name: 'มณัญฌญา จันทราพรไพลิน',
                    nickname: 'ไอซ์',
                    gender: 'หญิง',
                    age: '10',
                    course: 'iStar',
                    remaining: 1,
                    reservation: [
                        {
                            no: 1,
                            classdate: '2023-12-21',
                            classtime: '10:00-11:30',
                        }
                    ]
                },
                {
                    id: 2,
                    photo: 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/boy_person_avatar_kid-512.png',
                    name: 'ธนา ผโลดม',
                    nickname: 'บุช',
                    gender: 'ชาย',
                    age: '12',
                    course: 'G.A.',
                    remaining: 2,
                    reservation: [
                        {
                            no: 1,
                            classdate: '2023-12-22',
                            classtime: '10:00-11:30',
                        },
                        {
                            no: 2,
                            classdate: '2023-12-23',
                            classtime: '10:00-11:30',
                        }
                    ]
                },
                {
                    id: 3,
                    photo: 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/indian_native_boy_kid-512.png',
                    name: 'ธนภรณ์ อุทัยศรี',
                    nickname: 'อีฟ',
                    gender: 'หญิง',
                    age: '11',
                    course: 'G.A.',
                    remaining: 3,
                    reservation: [
                        {
                            no: 1,
                            classdate: '2024-01-03',
                            classtime: '09:00-10:30',
                        },
                        {
                            no: 2,
                            classdate: '2024-01-04',
                            classtime: '14:00-15:30',
                        },
                        {
                            no: 3,
                            classdate: '2024-01-05',
                            classtime: '09:00-10:30',
                        },
                        {
                            no: 4,
                            classdate: '2024-01-06',
                            classtime: '09:00-10:30',
                        },
                        {
                            no: 5,
                            classdate: '2024-01-07',
                            classtime: '14:00-15:30',
                        },
                        {
                            no: 6,
                            classdate: '2024-01-08',
                            classtime: '09:00-10:30',
                        },
                        {
                            no: 7,
                            classdate: '2024-01-09',
                            classtime: '09:00-10:30',
                        },
                        {
                            no: 8,
                            classdate: '2024-01-10',
                            classtime: '14:00-15:30',
                        },
                        {
                            no: 9,
                            classdate: '2024-01-11',
                            classtime: '09:00-10:30',
                        },
                        {
                            no: 10,
                            classdate: '2024-01-13',
                            classtime: '09:00-10:30',
                        },
                        {
                            no: 11,
                            classdate: '2024-01-14',
                            classtime: '14:00-15:30',
                        },
                        {
                            no: 12,
                            classdate: '2024-01-15',
                            classtime: '09:00-10:30',
                        }
                    ]
                },
            ],
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