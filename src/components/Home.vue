<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-home-account"></span> {{ $t('home.title') }}</h1>
        </div>

        <div class="container-content">
            <!-- Empty state -->
            <div v-if="familylist == null || familylist.length === 0" class="empty-state">
                <v-icon color="#94a3b8" size="48">mdi-account-off-outline</v-icon>
                <p>{{ $t('home.addFamilyHint') }}</p>
            </div>

            <!-- ── Unified card ── -->
            <v-card v-else class="card-opacity home-card">

                <!-- ── Family selector ── -->
                <div class="home-section-header">
                    <span class="mdi mdi-account-group"></span> {{ $t('home.familySection') }}
                </div>
                <div class="family-selector">
                    <div v-for="p in familylist" :key="p.studentid"
                         class="family-row"
                         :class="{ 'family-row--active': p.studentid === studentid }"
                         @click="selectChild(p)">
                        <div class="avatar-wrap">
                            <v-img :src="p.gender === 'หญิง' ? profileGirl : profileBoy" cover
                                   width="46" height="46"></v-img>
                        </div>
                        <div class="family-row-info">
                            <span class="member-name">{{ p.fullname }}</span>
                            <span v-if="p.course_shortname" class="member-course">{{ p.course_shortname }}</span>
                        </div>
                        <v-icon v-if="p.studentid === studentid" color="primary" size="18">mdi-chevron-right</v-icon>
                    </div>
                </div>

                <!-- ── No selection hint ── -->
                <div v-if="!studentSelected" class="no-selection-hint">
                    <v-icon color="#94a3b8" size="32">mdi-gesture-tap</v-icon>
                    <p>{{ $t('home.selectMember') }}</p>
                </div>

                <!-- ── Information (appears when member selected) ── -->
                <template v-if="studentSelected">
                    <v-divider></v-divider>

                    <!-- Section header -->
                    <div class="home-section-header">
                        <span class="mdi mdi-information-outline"></span> {{ $t('home.information') }}
                    </div>

                    <!-- Profile photo -->
                    <div class="info-photo">
                        <div class="profile-wrap">
                            <v-img :src="imagePreview || (studentSelected.gender === 'หญิง' ? profileGirl : profileBoy)"
                                   cover width="130" height="130"></v-img>
                        </div>
                    </div>

                    <!-- Name & age -->
                    <div class="info-text">
                        <p class="member-fullname">{{ studentSelected.fullname }}</p>
                        <p class="member-age">{{ $t('home.genderAge', { gender: studentSelected.gender, age: calculateAge(studentSelected.dateofbirth) }) }}</p>
                    </div>

                    <!-- Course info -->
                    <div v-if="studentSelected.courserefer">
                        <div class="home-section-header" style="margin-top: 4px;">
                            <span class="mdi mdi-book-open-variant"></span> {{ $t('home.courseInfo') }}
                        </div>
                        <div class="course-chip-list">
                            <span class="course-chip">{{ $t('table.courseRef') }} {{ studentSelected.courserefer }}</span>
                            <span class="course-chip">{{ studentSelected.coursename }}</span>
                            <span v-if="studentSelected.coursetype === 'Monthly'" class="course-chip">{{ $t('home.monthly') }}</span>
                            <span v-else class="course-chip">{{ $t('table.remaining') }} {{ studentSelected.remaining }}</span>
                            <span v-if="studentSelected.expiredate" class="course-chip">
                                {{ $t('table.expireDate') }} {{ new Date(studentSelected.expiredate).toLocaleDateString('th-TH', options) }}
                            </span>
                            <span v-if="studentSelected.expiredate && isExpire(studentSelected.expiredate)"
                                  class="course-chip expired-chip">{{ $t('home.expired') }}</span>
                        </div>
                    </div>

                    <!-- ── Reservation ── -->
                    <v-divider></v-divider>

                    <div class="home-section-header">
                        <span class="mdi mdi-calendar-check"></span> {{ $t('home.reservation') }}
                    </div>

                    <div v-if="memberReservationDetail && memberReservationDetail.length > 0">
                        <div class="reservation-header">
                            <span>{{ $t('home.date') }}</span>
                            <span>{{ $t('home.classTime') }}</span>
                        </div>
                        <div v-for="item in memberReservationDetail" :key="item.classdate + item.classtime"
                             class="reservation-row">
                            <span class="res-date">{{ format_date(item.classdate) }}</span>
                            <span class="res-time">{{ item.classtime }}</span>
                        </div>
                    </div>
                    <div v-else class="reservation-empty">
                        <v-icon color="#94a3b8" size="24">mdi-calendar-blank-outline</v-icon>
                        <span>{{ $t('home.noBooking') }}</span>
                    </div>

                </template>

            </v-card>

            <!-- CTA button — outside card -->
            <div v-if="studentSelected" class="below-card-cta">
                <v-btn v-if="studentSelected.expiredate && isExpire(studentSelected.expiredate)"
                       block class="pulse-button" size="large"
                       style="background: linear-gradient(145deg,#f87171,#dc2626)!important; color:#fff!important; border-radius:14px!important; font-weight:700!important; box-shadow:5px 5px 14px rgba(220,38,38,0.35),-4px -4px 10px rgba(255,255,255,0.75)!important;">
                    <v-icon>mdi-close-thick</v-icon>
                    &nbsp;{{ $t('home.courseExpired') }}
                </v-btn>
                <v-btn v-else block class="pulse-button neu-action-btn" size="large"
                       @click="doReservation">
                    <v-icon>mdi-emoticon-plus</v-icon>
                    &nbsp;{{ $t('home.bookClass') }}
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
        return { isAuthenticated };
    },
    components: {
        VBottomNavigation,
        VBottomSheet,
        TrinityRingsSpinner
    },
    methods: {
        selectChild(student) {
            this.studentid = student.studentid
            this.studentSelected = student
            this.imagePreview = null
            this.loadProfileImage()
            this.getReservationDetail(student.studentid)
        },
        doReservation() {
            if (this.studentSelected == null) {
                this.$emit('onErrorHandler', this.$t('home.errorSelectFirst'))
                return
            }
            if(this.studentSelected.courserefer == null){
                this.$emit('onErrorHandler', this.$t('home.errorNoCourse'))
                return;
            }
            if (this.studentSelected.expiredate && (new Date(this.studentSelected.expiredate) < new Date())) {
                this.$emit('onErrorHandler', this.$t('home.errorExpired'))
                return;
            }
            if (this.studentSelected.coursetype != 'Monthly') {
                if (this.studentSelected.remaining <= 0) {
                    this.$emit('onErrorHandler', this.$t('home.errorNoRemaining'))
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
                    if (response.data.success) {
                        this.familylist = response.data.results
                    }
                })
                .catch(error => {
                    //console.error(error);
                });
            this.$emit('onLoading', false)
        },
        async loadProfileImage() {
            try {
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
                        this.imagePreview = null;
                    }
                }
            } catch (error) {
                //console.error("Error loading profile image:", error);
            }
        },
        async getReservationDetail(studentid) {
            const token = this.$store.getters.getToken;
            await axios
                .post(this.baseURL + '/getMemberReservationDetail', {
                    studentid: studentid,
                    courserefer: this.studentSelected.courserefer
                },
                    {
                        headers: { Authorization: `Bearer ${token}`, }
                    })
                .then(response => {
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
                alert('Invalid Date of Birth')
                return;
            }
            const diffTime = currentDate - new Date(birthDate);
            const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            let years = Math.floor(totalDays / 365.25);
            let months = Math.floor((totalDays % 365.25) / 30.4375);
            let days = Math.floor((totalDays % 365.25) % 30.4375);
            return this.$t('home.ageUnit', { years, months, days })
        },
        isExpire(expdate) {
            if(!expdate) return true;
            const today = new Date();
            const expirationDate = new Date(expdate);
            return expirationDate < today;
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
            if (!token) {
                this.$emit('onClickChangeState', 'login')
                return;
            }
            await axios
                .post(this.baseURL + '/verifyToken', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(response => {
                    this.getFamilyMember()
                    if (this.student != null) {
                        this.selectChild(this.student)
                    }
                })
                .catch(error => {
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
.home-card {
    width: 100%;
}

/* Section header band — same style as toolbar in admin pages */
.home-section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: linear-gradient(to right, #eef0f5, #f5f7fb);
    border-bottom: 1px solid rgba(163, 177, 198, 0.18);
}

.home-section-header .mdi {
    color: #6366f1;
    font-size: 15px;
}

/* ── Family rows ── */
.family-row {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    cursor: pointer;
    border-bottom: 1px solid rgba(163, 177, 198, 0.1);
    transition: background 0.15s ease;
}

.family-row:last-child {
    border-bottom: none;
}

.family-row:active {
    background: rgba(99, 102, 241, 0.06);
}

.family-row--active {
    background: rgba(99, 102, 241, 0.07);
    border-left: 3px solid #6366f1;
}

.avatar-wrap {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: #e0e5ec;
}

.family-row-info {
    flex: 1;
    margin-left: 12px;
    display: flex;
    flex-direction: column;
}

.member-name {
    font-weight: 600;
    color: #334155;
    font-size: 14px;
}

.member-course {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 2px;
}

/* ── No selection hint ── */
.no-selection-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px;
    color: #94a3b8;
    font-size: 13px;
}

/* ── Profile photo ── */
.info-photo {
    padding: 20px 0 12px;
    display: flex;
    justify-content: center;
}

.profile-wrap {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    overflow: hidden;
    background: #e0e5ec;
}

/* ── Info text ── */
.info-text {
    text-align: center;
    padding: 4px 16px 12px;
}

.member-fullname {
    font-size: 16px;
    font-weight: 700;
    color: #334155;
    margin: 0 0 4px;
}

.member-age {
    font-size: 13px;
    color: #64748b;
    margin: 0;
}

/* ── Course chips ── */
.course-chip-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 16px 16px;
}

.course-chip {
    background: linear-gradient(145deg, #f0f3f8, #e8ebf1);
    padding: 5px 16px;
    border-radius: 8px;
    color: #475569;
    font-weight: 500;
    font-size: 13px;
    display: inline-block;
}

.expired-chip {
    background: linear-gradient(145deg, #fee2e2, #fecaca) !important;
    color: #dc2626 !important;
    font-weight: 700;
}

/* ── Reservation ── */
.reservation-header {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    border-bottom: 1px solid rgba(163, 177, 198, 0.15);
}

.reservation-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 16px;
    border-bottom: 1px solid rgba(163, 177, 198, 0.1);
    font-size: 14px;
}

.reservation-row:last-child {
    border-bottom: none;
}

.res-date {
    color: #334155;
    font-weight: 500;
}

.res-time {
    color: #6366f1;
    font-weight: 600;
    background: rgba(99, 102, 241, 0.08);
    padding: 3px 12px;
    border-radius: 6px;
    font-size: 13px;
}

.reservation-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px;
    color: #94a3b8;
    font-size: 13px;
}

/* ── CTA below card ── */
.below-card-cta {
    padding: 16px 0 8px;
}

/* ── Empty state ── */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 20px;
    color: #94a3b8;
    font-size: 14px;
    text-align: center;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
}

.pulse-button {
    animation: pulse 1.5s infinite;
}
</style>
