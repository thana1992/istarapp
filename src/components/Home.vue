<template>
    <div class="id-scope home-page">
        <!-- ── Greeting header ── -->
        <div class="pg-head">
            <div class="pg-ico"><span class="mdi mdi-home-account"></span></div>
            <div>
                <div class="id-h1">{{ $t('home.title') }} 🌟</div>
                <div class="pg-sub">{{ $t('home.familySection') }}</div>
            </div>
        </div>

        <!-- ── Proactive alerts: expired / low sessions / expiring soon ── -->
        <template v-if="expiryWarnings.length">
            <v-alert v-for="w in expiryWarnings" :key="'warn-' + w.studentid"
                     :type="w.kind === 'expired' ? 'error' : 'warning'"
                     variant="tonal" border="start" density="comfortable" class="mb-3">
                {{ warningText(w) }}
            </v-alert>
        </template>

        <!-- ── Empty state ── -->
        <div v-if="familylist == null || familylist.length === 0" class="scard" style="padding:0">
            <div class="id-empty">
                <div class="mdi mdi-account-off-outline"></div>
                <div style="margin-top:8px">{{ $t('home.addFamilyHint') }}</div>
            </div>
        </div>

        <template v-else>
            <!-- ── Family students ── -->
            <div class="isk-sec" style="margin-bottom:10px">{{ $t('home.familySection') }}</div>
            <div class="cards3" style="margin-bottom:24px">
                <div v-for="p in familylist" :key="p.studentid"
                     class="scard home-scard"
                     :class="{ 'home-scard--active': p.studentid === studentid }"
                     style="padding:20px"
                     @click="selectChild(p)">
                    <div class="row" style="gap:12px;margin-bottom:12px">
                        <span class="tt-avatar home-card-avatar" style="background:var(--c-primary)">
                            <v-img v-if="p.profile_image_url"
                                   :src="p.profile_image_url" cover width="52" height="52"></v-img>
                            <v-img v-else
                                   :src="p.gender === 'หญิง' ? profileGirl : profileBoy" cover width="52" height="52"></v-img>
                        </span>
                        <div style="flex:1;min-width:0">
                            <div class="strong" style="font-size:17px;color:var(--c-text-heading)">{{ p.fullname }}</div>
                            <div class="t-cap">
                                <template v-if="p.course_shortname">{{ p.course_shortname }} · </template>{{ $t('home.genderAge', { gender: p.gender, age: calculateAge(p.dateofbirth) }) }}
                            </div>
                        </div>
                        <span class="badge"
                              :class="!p.courserefer ? 'badge-neutral' : (p.expiredate && isExpire(p.expiredate)) ? 'badge-error' : p.coursetype === 'Monthly' ? 'badge-success' : (p.remaining <= 0) ? 'badge-error' : (p.remaining <= 2) ? 'badge-warning' : 'badge-success'">
                            <template v-if="!p.courserefer">{{ $t('home.noCourse') }}</template>
                            <template v-else-if="p.expiredate && isExpire(p.expiredate)">{{ $t('home.expired') }}</template>
                            <template v-else-if="p.coursetype === 'Monthly'">{{ $t('home.monthly') }}</template>
                            <template v-else-if="p.remaining <= 0">{{ $t('home.usedUp') }}</template>
                            <template v-else>{{ $t('home.remainBadge', { n: p.remaining }) }}</template>
                        </span>
                    </div>

                    <!-- per-session: remaining count + segmented "pips" (one block per session,
                         filled = remaining; empties as classes are used = "ค่อยๆ พร่องลง") -->
                    <div v-if="p.courserefer && p.coursetype !== 'Monthly'" style="margin-bottom:10px">
                        <div class="row" style="justify-content:space-between;font-size:12.5px;margin-bottom:5px">
                            <span class="muted">{{ $t('table.remaining') }}</span>
                            <span class="strong">{{ remainingText(p) }}</span>
                        </div>
                        <!-- used (faded) pips sit at the FRONT, remaining (filled) at the BACK;
                             as sessions are used the filled part recedes toward the back -->
                        <div class="quota-pips" :aria-label="remainingText(p)">
                            <span v-for="i in pipCount(p)" :key="i" class="quota-pip"
                                  :class="{ on: i > pipCount(p) - remainNum(p) }"
                                  :style="i > pipCount(p) - remainNum(p) ? { background: pipFill(p) } : null"></span>
                        </div>
                    </div>
                    <!-- monthly: time-to-expiry bar (falls back to the current month when no expiry is stored) -->
                    <div v-else-if="p.courserefer && p.coursetype === 'Monthly'" style="margin-bottom:10px">
                        <div class="row" style="justify-content:space-between;font-size:12.5px;margin-bottom:5px">
                            <span class="muted">{{ $t('home.timeLeftLabel') }}</span>
                            <span class="strong">{{ monthlyDaysText(p) }}</span>
                        </div>
                        <!-- remaining time sits on the RIGHT and recedes right as days pass
                             (same "draining" direction as the per-session pips) -->
                        <div class="quota-bar">
                            <div class="quota-bar-fill" :style="{ width: monthlyPct(p) + '%', background: monthlyFill(p) }"></div>
                        </div>
                    </div>
                    <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:14px">
                        <span>{{ p.coursename || p.course_shortname || $t('home.noCourse') }}</span>
                        <span v-if="p.expiredate" class="muted">{{ $t('table.expireDate') }} {{ format_date(p.expiredate) }}</span>
                    </div>

                    <button class="id-btn id-btn-primary" style="width:100%"
                            @click.stop="selectChild(p); doReservation()">
                        <span class="mdi mdi-calendar-plus"></span> {{ $t('home.bookClass') }}
                    </button>
                </div>
            </div>

            <!-- ── Reservation schedule of selected member ── -->
            <div class="isk-sec" style="margin-bottom:10px">{{ $t('home.reservation') }}</div>
            <div class="scard" style="padding:0">
                <div v-if="!studentSelected" class="id-empty">
                    <div class="mdi mdi-gesture-tap"></div>
                    <div style="margin-top:8px">{{ $t('home.selectMember') }}</div>
                </div>
                <!-- loading: skeleton rows so switching members feels like a fresh fetch, not a flash -->
                <div v-else-if="loadingHistory">
                    <div v-for="i in 3" :key="'hsk' + i" class="row" style="gap:10px;padding:14px 18px;border-bottom:1px solid var(--c-border)">
                        <div class="id-skel" style="width:30px;height:30px;border-radius:50%"></div>
                        <div class="col" style="gap:6px;flex:1">
                            <div class="id-skel" style="height:13px;width:45%"></div>
                            <div class="id-skel" style="height:11px;width:30%"></div>
                        </div>
                        <div class="id-skel" style="height:20px;width:74px;border-radius:999px"></div>
                    </div>
                </div>
                <div v-else-if="memberReservationDetail && memberReservationDetail.length > 0" class="id-fade-in" :key="studentid">
                    <div v-for="item in memberReservationDetail" :key="item.classdate + item.classtime"
                         class="row home-hist-row" style="justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--c-border)">
                        <div class="row" style="gap:10px">
                            <span class="tt-avatar" style="background:var(--c-primary)">
                                <v-img v-if="imagePreview" :src="imagePreview" cover width="30" height="30"></v-img>
                                <template v-else>{{ (studentSelected.fullname || '?').replace('น้อง','').charAt(0) }}</template>
                            </span>
                            <div class="col" style="gap:1px">
                                <span class="strong">{{ studentSelected.fullname }}<template v-if="studentSelected.course_shortname"> · {{ studentSelected.course_shortname }}</template></span>
                                <span class="t-cap"><span class="mdi mdi-calendar"></span> {{ format_date(item.classdate) }} · {{ item.classtime }}</span>
                            </div>
                        </div>
                        <span class="badge badge-info">{{ item.classtime }}</span>
                    </div>
                </div>
                <div v-else class="id-empty">
                    <div class="mdi mdi-calendar-blank-outline"></div>
                    <div style="margin-top:8px">{{ $t('home.noBooking') }}</div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { computed } from 'vue';
import axios from 'axios';
import moment from 'moment'
import { mapGetters } from 'vuex';
export default {
    setup() {
        const isAuthenticated = computed(() => !!localStorage.getItem('token'));
        return { isAuthenticated };
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
                        this.loadFamilyImages()
                    }
                })
                .catch(() => {
                    //console.error(error);
                });
            this.$emit('onLoading', false)
        },
        async loadFamilyImages() {
            if (!this.familylist || this.familylist.length === 0) return;
            const token = this.$store.getters.getToken;
            await Promise.all(
                this.familylist.map(async (member) => {
                    if (member.profile_image_url) return;
                    try {
                        const response = await axios.get(
                            this.baseURL + `/student/${member.studentid}/profile-image`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        if (response.data.imageUrl) {
                            member.profile_image_url = response.data.imageUrl;
                        } else if (response.data.image) {
                            member.profile_image_url = `data:image/*;base64,${response.data.image}`;
                        }
                    } catch (e) {
                        // ไม่มีรูป — ใช้ default
                    }
                })
            );
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
            this.loadingHistory = true
            const t0 = Date.now()
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
                .catch(() => {
                    //console.error(error);
                })
                .finally(async () => {
                    await this.$minLoad(t0)
                    this.loadingHistory = false
                });
        },
        format_date(value) {
            if (value) {
                return moment(value).format('DD/MM/YYYY')
            }
        },
        calculateAge(birthDate) {
            if (!birthDate) return;
            const currentDate = new Date();
            if (new Date(birthDate) > currentDate) {
                alert(this.$t('common.invalidDob'))
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
        daysUntil(d) {
            if (!d) return null;
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const target = new Date(d); target.setHours(0, 0, 0, 0);
            return Math.round((target - today) / 86400000);
        },
        warningText(w) {
            if (w.kind === 'expired') return this.$t('home.alertExpired', { name: w.name });
            if (w.kind === 'low') return this.$t('home.alertLow', { name: w.name, n: w.remaining, date: this.format_date(w.expiredate) });
            return this.$t('home.alertExpireSoon', { name: w.name, date: this.format_date(w.expiredate) });
        },
        // `total` = original purchased quota from getFamilyMember (Limited courses;
        // NULL for Monthly, = remaining for trial owners). Fall back to a last-~8-
        // sessions gauge only on the rare chance it's missing.
        courseTotal(p) {
            const remaining = Number(p.remaining) || 0;
            const total = Number(p.total);
            return total > 0 ? total : Math.max(remaining, 8);
        },
        remainPct(p) {
            const remaining = Number(p.remaining) || 0;
            return Math.max(0, Math.min(100, (remaining / this.courseTotal(p)) * 100));
        },
        remainColor(p) {
            const r = Number(p.remaining) || 0;
            if (r <= 2) return '#ef4444';
            if (r <= 4) return '#f59e0b';
            return 'primary';
        },
        // segmented quota "pips": one block per purchased session, filled = remaining
        pipCount(p) { return Math.max(1, this.courseTotal(p)); },
        remainNum(p) { return Math.max(0, Number(p.remaining) || 0); },
        pipFill(p) { const c = this.remainColor(p); return c === 'primary' ? 'var(--c-primary)' : c; },
        monthlyFill(p) { const c = this.monthlyColor(p); return c === 'primary' ? 'var(--c-primary)' : c; },
        remainingText(p) {
            const remaining = Number(p.remaining) || 0;
            if (Number(p.total) > 0) return this.$t('home.remainOf', { n: remaining, total: Number(p.total) });
            return this.$t('home.remainBadge', { n: remaining });
        },
        // Monthly courses are unlimited but time-boxed — show progress toward expiry.
        // If the backend stores an expiry date we drain toward it over a ~30-day window;
        // otherwise the subscription is assumed valid through the end of the current
        // calendar month, so the bar always renders (consistent across every card).
        monthlyRemain(p) {
            if (p.expiredate) return { daysLeft: this.daysUntil(p.expiredate), totalDays: 30 };
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            return { daysLeft: lastDay - today.getDate(), totalDays: lastDay };
        },
        monthlyDaysText(p) {
            const { daysLeft } = this.monthlyRemain(p);
            return daysLeft > 0 ? this.$t('home.daysValue', { n: daysLeft }) : this.$t('home.expired');
        },
        monthlyPct(p) {
            const { daysLeft, totalDays } = this.monthlyRemain(p);
            return Math.max(0, Math.min(100, ((daysLeft || 0) / totalDays) * 100));
        },
        monthlyColor(p) {
            const { daysLeft } = this.monthlyRemain(p);
            if (daysLeft === null || daysLeft <= this.NEAR_DAYS) return '#ef4444';
            if (daysLeft <= 14) return '#f59e0b';
            return 'primary';
        },
        async uploadPhotoFile(file, studentid) {
            if (!file) return;
            if (file.size > 4 * 1024 * 1024) {
                this.$emit('onErrorHandler', this.$t('msg.fileTooLarge'));
                return;
            }
            const ext = file.name.split('.').pop();
            const renamedFile = new File([file], `${studentid}.${ext}`, { type: file.type });
            const formData = new FormData();
            formData.append('profileImage', renamedFile);
            formData.append('studentid', String(studentid));
            try {
                this.$emit('onLoading', true);
                const response = await fetch(this.baseURL + '/uploadProfileImage', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${this.token}` },
                    body: formData,
                });
                const data = await response.json();
                if (data.url) {
                    const member = this.familylist.find(p => p.studentid === studentid);
                    if (member) member.profile_image_url = data.url;
                    if (this.studentSelected && this.studentSelected.studentid === studentid) {
                        this.imagePreview = data.url;
                    }
                    this.$emit('onSuccessHandler', this.$t('msg.uploadSuccess'));
                }
            } catch (e) {
                this.$emit('onErrorHandler', this.$t('msg.uploadFail'));
            } finally {
                this.$emit('onLoading', false);
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
            loadingHistory: false,
            studentid: null,
            LOW_SESSIONS: 2,   // per-session courses with ≤ this many left → warn
            NEAR_DAYS: 7,      // expiry within this many days → warn
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
        // family members needing attention: expired / used-up / low sessions / expiring soon
        expiryWarnings() {
            if (!this.familylist) return [];
            const out = [];
            for (const p of this.familylist) {
                if (!p.courserefer) continue;
                const perSession = p.coursetype !== 'Monthly';
                const remaining = Number(p.remaining) || 0;
                const expired = p.expiredate && this.isExpire(p.expiredate);
                const usedUp = perSession && remaining <= 0;
                const daysLeft = this.daysUntil(p.expiredate);
                const nearExpiry = daysLeft !== null && daysLeft >= 0 && daysLeft <= this.NEAR_DAYS;
                const lowSessions = perSession && remaining > 0 && remaining <= this.LOW_SESSIONS;
                if (expired || usedUp) {
                    out.push({ studentid: p.studentid, name: p.fullname, kind: 'expired' });
                } else if (lowSessions) {
                    out.push({ studentid: p.studentid, name: p.fullname, kind: 'low', remaining, expiredate: p.expiredate });
                } else if (nearExpiry) {
                    out.push({ studentid: p.studentid, name: p.fullname, kind: 'soon', expiredate: p.expiredate });
                }
            }
            return out;
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
                .then(() => {
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
/* segmented quota meter — one pip per session, filled = remaining (drains as used) */
.quota-pips { display: flex; flex-wrap: wrap; gap: 3px; }
.quota-pip { flex: 1 1 8px; min-width: 8px; height: 8px; border-radius: 3px; background: var(--c-surface-3); transition: background .2s ease; }
/* monthly: continuous draining bar — fill anchored to the right, recedes as days pass */
.quota-bar { display: flex; justify-content: flex-end; height: 8px; border-radius: 4px; background: var(--c-surface-3); overflow: hidden; }
.quota-bar-fill { height: 100%; border-radius: 4px; transition: width .3s ease; }

/* ── Student card (selectable) ── */
.home-scard {
    cursor: pointer;
    transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
    /* flex column so the "Book a class" button can be pinned to the bottom — cards
       in a grid row are equal height (align-items:stretch), so every button lines up */
    display: flex;
    flex-direction: column;
}

/* pin the booking button to the bottom of every card regardless of content height */
.home-scard > .id-btn-primary {
    margin-top: auto;
}

.home-scard:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.home-scard--active {
    border-color: var(--c-primary);
    box-shadow: 0 0 0 1px var(--c-primary), var(--shadow-md);
}

/* clip the profile image inside the round avatar chip */
.home-card-avatar {
    width: 52px;
    height: 52px;
    flex: 0 0 52px;
    font-size: 20px;
    overflow: hidden;
}

.tt-avatar :deep(.v-img),
.tt-avatar :deep(.v-responsive) {
    width: 100%;
    height: 100%;
    border-radius: inherit;
}

.home-hist-row:last-child {
    border-bottom: none !important;
}
</style>
