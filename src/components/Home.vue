<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-home-account"></span> Home</h1>
        </div>
        <div v-if="familylist != null && familylist.length > 0">
            <div class="container-content">
                <h3 class="group-header">Family</h3>
                <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                <v-divider color="#fffff" thickness="3"></v-divider>
                <div class="familylist">
                    <v-table class="family-list">
                        <tbody>
                            <tr v-for="p in familylist" :key="p.studentid" style="cursor: pointer;" class="tr-rows"
                                @click="selectChild(p)">
                                <td style="width: 20vw;">
                                    <v-img v-if="p.gender === 'หญิง'" :src="profileGirl" cover
                                        class="pa-4 bg-secondary rounded-circle d-inline-block"
                                        style="display: flex !important;"></v-img>
                                    <v-img v-else :src="profileBoy" cover
                                        class="pa-4 bg-secondary rounded-circle d-inline-block"
                                        style="display: flex !important;"></v-img>
                                </td>
                                <td style="width: 70vw;">
                                    <p>{{ p.fullname }}</p>
                                </td>
                                <td style="width: 10vw;">
                                    <p>{{ p.course_shortname }}</p>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </div>
            </div>
            <div class="container-content" v-if="studentSelected">
                <h3 class="group-header">Information</h3>
                <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                <v-divider color="#fffff" thickness="3"></v-divider>
                <div class="information">
                    <Transition v-for="p in familylist">
                        <div v-if="p.studentid == studentid">
                            <div class="info-photo">
                                <v-img v-if="imagePreview != null" :src="imagePreview" cover
                                    class="pa-6 bg-secondary rounded-circle d-inline-block" style="display: flex !important; 
                                width: 25vw;"></v-img>
                                <v-img v-else-if="p.gender === 'หญิง'" :src="profileGirl" cover
                                    class="pa-6 bg-secondary rounded-circle d-inline-block"
                                    style="display: flex !important; width: 25vw;"></v-img>
                                <v-img v-else :src="profileBoy" cover
                                    class="pa-6 bg-secondary rounded-circle d-inline-block"
                                    style="display: flex !important;  width: 25vw;"></v-img>
                            </div>
                            <div class="info-detail">
                                <p>{{ p.fullname }}</p>
                                <p>เพศ {{ p.gender }} อายุ {{ calculateAge(p.dateofbirth) }}</p>
                                <br>
                                <h3 class="group-header">Course Info</h3>
                                <div v-if="p.courserefer">
                                    <p><label>Course No. {{ p.courserefer }}</label></p>
                                    <p>
                                        <label>คอร์ส {{ p.coursename }}</label>
                                    </p>
                                    <p>
                                        <label v-if="p.coursetype == 'Monthly'"> รายเดือน</label>
                                        <label v-else-if="p.remaining == 0">คงเหลือ {{ p.remaining }} ครั้ง</label>
                                        <label v-else>คงเหลือ {{ p.remaining }} ครั้ง</label>
                                    </p>
                                    <p>
                                        <label v-if="p.expiredate">หมดอายุ {{ new Date(p.expiredate).toLocaleDateString('th-TH', this.options) }}</label>
                                    </p>
                                    <p>
                                        <label v-if="p.expiredate && isExpire(p.expiredate)" style="color: red;"> (หมดอายุแล้ว)</label>
                                    </p>
                                </div>

                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
            <Transition v-if="studentSelected">
                <div class="container-content" >
                    <h3 class="group-header">Reservation</h3>
                    <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                    <v-divider color="#fffff" thickness="3"></v-divider>

                    <Transition v-if="memberReservationDetail">
                        <v-table class="family-list">
                            <thead>
                                <tr>
                                    <!-- <th class="text-left">No.</th> -->
                                    <th class="text-left">Date</th>
                                    <th class="text-left">Class Time</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="item in memberReservationDetail" :key="item.studentid" class="tr-rows">
                                    <!-- <td>{{ item.no }}</td> -->
                                    <td>{{ format_date(item.classdate) }}</td>
                                    <td>{{ item.classtime }}</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </Transition>
                </div>
            </Transition>
            <Transition v-else>
                <div class="container-content" style="text-align: center; padding-top: 5vh; padding-bottom: 5vh; ">
                    <p>Choose you member for see information</p>
                </div>
            </Transition>
        </div>
        <div v-else>
            <p>Please Add your family member in <u>FAMILY</u> Menu</p>
        </div>
        <div v-if="studentSelected">
            <div v-if="studentSelected.expiredate && isExpire(studentSelected.expiredate)" style="text-align: center; padding-top: 8vh; padding-bottom: 5vh;">
                <v-btn color="red" rounded class="ma-2 pulse-button">
                    <v-icon left>mdi-close-thick</v-icon>
                    &nbsp;Course Expired!!
                </v-btn>
            </div>
            <div v-else="studentSelected.expiredate && !isExpire(studentSelected.expiredate)" style="text-align: center; padding-top: 8vh; padding-bottom: 5vh;">
                <v-btn color="green" rounded class="ma-2 pulse-button" @click="doReservation">
                    <v-icon left>mdi-emoticon-plus</v-icon>
                    &nbsp;Book a class
                </v-btn>
            </div>
        </div>

    </div>
</template>

<script>
import { VBottomNavigation, VBottomSheet } from 'vuetify/lib/components/index.mjs'
import { ref, computed, onMounted, inject } from 'vue';
import axios from 'axios';
import moment from 'moment'
import { mapGetters } from 'vuex';
import { TrinityRingsSpinner } from 'epic-spinners'
export default {
    setup() {
        const isAuthenticated = computed(() => !!localStorage.getItem('token'));
        //console.log(isAuthenticated.value)

        return { isAuthenticated };
    },
    components: {
        VBottomNavigation,
        VBottomSheet,
        TrinityRingsSpinner
    },
    methods: {
        selectChild(student) {
            //console.log(student)
            this.studentid = student.studentid
            this.studentSelected = student
            this.loadProfileImage()
            this.getReservationDetail(student.studentid)
        },
        doReservation() {
            if (this.studentSelected == null) {
                this.$emit('onErrorHandler', 'Please select any one of your family')
                return
            }
            if(this.studentSelected.courserefer == null){
                this.$emit('onErrorHandler', 'ไม่สามารถจองคลาสได้ เนื่องจากยังไม่มีข้อมูลคอร์สเรียน กรุณาติดต่อ Admin')
                return;
            }
            if (this.studentSelected.expiredate && (new Date(this.studentSelected.expiredate) < new Date())) {
                this.$emit('onErrorHandler', 'ไม่สามารถจองคลาสได้ เนื่องจากหมดอายุแล้ว')
                return;
            }
            if (this.studentSelected.coursetype != 'Monthly') {
                if (this.studentSelected.remaining <= 0) {
                    this.$emit('onErrorHandler', 'ไม่สามารถจองคลาสได้ จำนวนคลาสของท่านหมดแล้ว')
                    return;
                }
            }
            this.$emit('collectData', this.studentSelected)
            this.$emit('onClickChangeState', 'reservation')
            this.$emit('initBack', 'home')
        },
        async getFamilyMember() {
            this.$emit('onLoading', true)
            const token = this.$store.getters.getToken;
            const user = JSON.parse(localStorage.getItem('userdata'))
            await axios
                .post(this.baseURL + '/getFamilyMember', {
                    familyid: user.familyid,
                },
                    {
                        headers: { Authorization: `Bearer ${token}`, }
                    })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.familylist = response.data.results
                        //console.log('familylist ', this.familylist)
                    }
                })
                .catch(error => {
                    //console.error(error);
                });
            this.$emit('onLoading', false)
        },
        async loadProfileImage() {
            try {
                // Replace 'gymnastId' with the actual ID of the gymnast
                if(this.studentSelected.profile_image_url){
                    this.imagePreview = this.studentSelected.profile_image_url;
                } else {
                    const response = await axios.get(
                        this.baseURL +
                        `/student/${this.studentSelected.studentid}/profile-image`,
                        { headers: { Authorization: `Bearer ${this.token}` } }
                    );
                    let profileImageUrl = response.data.imageUrl;
                    this.base64Image = response.data.image;
                    if (profileImageUrl) {
                        this.imagePreview = profileImageUrl;
                    } else if (response.data.image !== null) {
                        this.imagePreview = `data:image/*;base64,${response.data.image}`;
                    } else {
                        this.imagePreview = this.profileAvatar;
                    }
                }
            } catch (error) {
                //console.error("Error loading profile image:", error);
            }
        },
        async getReservationDetail(studentid) {
            const token = this.$store.getters.getToken;
            const user = JSON.parse(localStorage.getItem('userdata'))
            await axios
                .post(this.baseURL + '/getMemberReservationDetail', {
                    studentid: studentid,
                    courserefer: this.studentSelected.courserefer
                },
                    {
                        headers: { Authorization: `Bearer ${token}`, }
                    })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.memberReservationDetail = response.data.results
                    } else {
                        this.memberReservationDetail = []
                    }
                })
                .catch(error => {
                    //console.error(error);
                });
        },
        format_date(value) {
            if (value) {
                return moment(String(value)).format('DD/MM/YYYY')
            }
        },
        calculateAge(birthDate) {
            if (!birthDate) return;

            const currentDate = new Date();
            if (new Date(birthDate) > currentDate) {
                this.birthDate = null
                this.years = null;
                this.months = null;
                this.days = null;
                alert('Invalid Date of Birth')
            }

            const diffTime = currentDate - new Date(birthDate);
            const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            let years = Math.floor(totalDays / 365.25);
            let months = Math.floor((totalDays % 365.25) / 30.4375);
            let days = Math.floor((totalDays % 365.25) % 30.4375);
            return years + ' ปี ' + months + ' เดือน ' + days + ' วัน'

        },
        isExpire(expdate) {
            //console.log('expdate', expdate)
            if(!expdate) return true;
            //console.log('=====================')
            const today = new Date();
            const expirationDate = new Date(expdate);
            //console.log('today', this.format_date(today, 'YYYY-MM-DD'));
            //console.log('expirationDate', this.format_date(expirationDate, 'YYYY-MM-DD'));

            if (expirationDate < today) {
                return true;
            } else {
                return false;
            }
        },
    },
    props: {
        student: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            imagePreview: null,
            familylist: null,
            userdetail: null,
            memberReservationDetail: null,
            studentSelected: null,
            studentid: null,
            clickReservation: false,
            headers: [
                { title: 'Date', align: 'start', key: 'classdate' },
                { title: 'Class Time', align: 'start', key: 'classtime' },
            ],
            options: {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',

            },
        };
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
        profileGirl() {
            return require('@/assets/avatar/2.png')
        },
        profileBoy() {
            return require('@/assets/avatar/4.png')
        },
    },
    async created() {
        this.$emit('onLoading', true)
        try {
            const token = this.$store.getters.getToken;
            //console.log('check token '+ token)
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
                    this.getFamilyMember()
                    if (this.student != null) {
                        this.selectChild(this.student)
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
    font-size: 3.1vw;
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

.familylist {
    min-height: 5vh;
}

.info-detail {
    padding-top: 5%;
    text-align: center;
    width: 100%;
}
.info-detail label {
    background-color: yellow;
    padding: 0px 10px 0px 10px;
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