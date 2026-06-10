<template>
    <div>
        <div v-if="!isAddFamily">
            <div class="pg-head">
                <div class="pg-ico"><span class="mdi mdi-account-multiple"></span></div>
                <div>
                    <div class="id-h1">{{ $t('family.title') }}</div>
                    <div class="pg-sub">{{ $t('family.sectionHeader') }}</div>
                </div>
                <div style="flex:1"></div>
                <button class="id-btn id-btn-primary id-btn-sm" @click="doAddFamilyMember">
                    <span class="mdi mdi-account-plus"></span> {{ $t('family.addMember') }}
                </button>
            </div>

            <div class="cards3">
                <div v-for="people in family" :key="people.studentid"
                    class="scard fam-card" :class="{ 'fam-pending': people.journal === '1' }" style="padding:18px">
                    <div class="row" style="gap:12px;margin-bottom:12px">
                        <span class="tt-avatar fam-avatar"
                            style="width:48px;height:48px;font-size:18px;background:var(--c-primary)">
                            <v-img :src="people.profile_image_url || (people.gender === 'หญิง' ? profileGirl : profileBoy)"
                                cover width="48" height="48"></v-img>
                        </span>
                        <div style="flex:1;min-width:0">
                            <div class="strong" style="font-size:16px;color:var(--c-text-heading)">{{ people.fullname }}</div>
                            <div class="t-cap">
                                {{ people.gender }}<template v-if="people.dateofbirth"> · {{ calculateAge(people.dateofbirth) }} ขวบ</template><template v-if="people.level"> · Level {{ people.level }}</template>
                            </div>
                        </div>
                        <span v-if="people.journal === '1'" class="badge badge-warning"><span class="mdi mdi-clock-outline"></span> รออนุมัติ</span>
                    </div>

                    <div v-if="people.coursename || people.course_shortname" class="row" style="gap:6px;font-size:13px;margin-bottom:4px;color:var(--c-text-body)">
                        <span class="mdi mdi-book-open-variant" style="color:var(--c-primary)"></span> {{ people.coursename || people.course_shortname }}
                    </div>
                    <div v-if="people.school" class="row" style="gap:6px;font-size:13px;color:var(--c-text-muted)">
                        <span class="mdi mdi-school-outline"></span> {{ people.school }}
                    </div>

                    <div class="fam-actions">
                        <button class="id-btn id-btn-soft id-btn-sm" style="flex:1" @click="openEdit(people)">
                            <span class="mdi mdi-pencil"></span> {{ $t('table.edit') }}
                        </button>
                        <button v-if="people.journal === '1'" class="id-btn id-btn-ghost id-btn-sm fam-del" @click="onClickDelete(people)">
                            <span class="mdi mdi-delete-forever"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <AddFamily @onClickChangeState="ChangeStateFamily($event)" @onBlackToFamilylist="ChangeStateFamily('list')"
                @onErrorHandler="onError($event)" @onInfoHandler="onShowInfoDialog($event)"
                @onLoading="onLoading($event)"></AddFamily>
        </div>
    
    <!-- edit family member -->
    <id-modal v-model="editDialog" size="md" icon="mdi-account-edit" :title="$t('table.edit')" persistent>
        <div class="dlg-avatar" style="margin-bottom:20px">
            <div class="av-ph">
                <img v-if="editImagePreview" :src="editImagePreview" />
                <span v-else class="mdi mdi-account"></span>
            </div>
            <label class="av-cam"><span class="mdi mdi-camera"></span>
                <input type="file" accept="image/*" hidden @change="onMemberPhoto"></label>
        </div>

        <div class="modal-sec"><span class="mdi mdi-card-account-details-outline"></span> {{ $t('addFamily.title') }}</div>
        <div class="form-grid-3">
            <div class="field"><label>{{ $t('addFamily.firstname') }} <span class="req">*</span></label>
                <input class="id-input" v-model="edited.firstname"></div>
            <div class="field"><label>{{ $t('addFamily.middlename') }}</label>
                <input class="id-input" v-model="edited.middlename"></div>
            <div class="field"><label>{{ $t('addFamily.lastname') }} <span class="req">*</span></label>
                <input class="id-input" v-model="edited.lastname"></div>
        </div>
        <div class="form-grid-3" style="margin-top:14px">
            <div class="field"><label>{{ $t('addFamily.nickname') }}</label>
                <input class="id-input" v-model="edited.nickname"></div>
            <div class="field"><label>{{ $t('addFamily.gender') }}</label>
                <id-select v-model="edited.gender" placeholder="— เลือก —"
                    :options="[{ value: 'ชาย', label: $t('common.male') }, { value: 'หญิง', label: $t('common.female') }]"></id-select></div>
            <div class="field"><label>{{ $t('addFamily.dob') }}</label>
                <id-date v-model="edited.dateofbirth" placeholder="เลือกวันเกิด"></id-date></div>
        </div>
        <div class="form-grid" style="margin-top:14px">
            <div class="field full"><label>{{ $t('addFamily.school') }}</label>
                <input class="id-input" v-model="edited.school"></div>
        </div>
        <template #footer>
            <button class="id-btn id-btn-ghost" @click="editDialog = false">{{ $t('btn.cancel') }}</button>
            <button class="id-btn id-btn-primary" :disabled="!edited.firstname || !edited.lastname" @click="saveEdit">
                <span class="mdi mdi-content-save"></span> {{ $t('btn.save') }}</button>
        </template>
    </id-modal>

    <id-modal v-model="dialogDeleteNotify" size="sm" icon="mdi-delete-alert-outline" title="ยืนยันการลบ" persistent>
        <p style="margin:0">{{ deleteNotifyMsg }}</p>
        <template #footer>
            <button class="id-btn id-btn-ghost" @click="closeDeleteNotify">{{ $t('btn.cancel') }}</button>
            <button class="id-btn id-btn-primary" style="background:var(--c-error)" @click="deleteItemConfirm">
                <span class="mdi mdi-delete"></span> {{ $t('btn.ok') }}</button>
        </template>
    </id-modal>
</div>
</template>

<script>
import AddFamily from './AddFamily.vue'
import axios from 'axios';
import { mapGetters } from 'vuex';
export default {
    components: {
        AddFamily,
    },
    data() {
        return {
            isAddFamily: false,
            family: [],
            dialogDeleteNotify: false,
            people: {},
            editDialog: false,
            edited: { studentid: null, firstname: '', middlename: '', lastname: '', nickname: '', gender: '', dateofbirth: null, school: '' },
            editImagePreview: null,
            pendingPhotoFile: null,
        }
    },
    methods: {
        doAddFamilyMember() {
            this.$emit('onClickChangeState', 'addfamilymember')
            this.$emit('initBack', 'familylist')
        },
        ChangeStateFamily(state) {
            this.stateFamily = state
            if (state == 'add') {
                this.isAddFamily = true
            } else if (state == 'list') {
                this.getFamilyList()
                this.isAddFamily = false
            }
        },
        async getFamilyList() {
            this.$emit('onLoading', true)
            const token = this.$store.getters.getToken;
            const user = JSON.parse(localStorage.getItem('userdata'))
            await axios
                .post(this.baseURL + '/getFamilyList', {
                    familyid: user.familyid,
                },
                    {
                        headers: { Authorization: `Bearer ${token}`, }
                    })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.family = response.data.results
                    } else {
                        this.family = []
                    }
                })
                .catch(() => {
                    //console.error(error);
                });
            this.$emit('onLoading', false)
        },
        async deleteStudent() {
            this.$emit('onLoading', true)
            const token = this.$store.getters.getToken;
            await axios.post(this.baseURL + '/deleteStudent', {
                familyid: this.people.familyid,
                studentid: this.people.studentid,
                journal: this.people.journal
            },
                {
                    headers: { Authorization: `Bearer ${token}`, }
                })
                .then(response => {
                    //console.dir(response);
                    if (response.data.success) {
                        this.$emit('onInfoHandler', this.$t('msg.familyDeleted'));
                    } else {
                        this.$emit('onErrorHandler', response.data.message || this.$t('msg.familyLoadFail'));
                    }
                    this.getFamilyList()
                })
            this.$emit('onLoading', false)
        },
        onClickDelete(people) {
            this.deleteNotifyMsg = this.$t('family.confirmDelete', { name: people.fullname })
            this.dialogDeleteNotify = true
            this.people = people
        },
        calculateAge(dob) {
            if (!dob) return ''
            const d = new Date(dob)
            if (isNaN(d)) return ''
            const now = new Date()
            let age = now.getFullYear() - d.getFullYear()
            const m = now.getMonth() - d.getMonth()
            if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
            return age
        },
        openEdit(people) {
            // prefill from whatever getFamilyList returns; the user can complete any
            // missing field. Persists only via the safe /updateStudentByFamily endpoint.
            this.edited = {
                studentid: people.studentid,
                firstname: people.firstname || '',
                middlename: people.middlename || '',
                lastname: people.lastname || '',
                nickname: people.nickname || '',
                gender: people.gender || '',
                dateofbirth: people.dateofbirth || null,
                school: people.school || '',
            }
            this.editImagePreview = people.profile_image_url || null
            this.pendingPhotoFile = null
            this.editDialog = true
            this.loadMemberImage(people.studentid)
        },
        async loadMemberImage(studentid) {
            try {
                const token = this.$store.getters.getToken
                const res = await axios.get(this.baseURL + `/student/${studentid}/profile-image`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.data && res.data.imageUrl) {
                    this.editImagePreview = res.data.imageUrl
                } else if (res.data && res.data.image) {
                    this.editImagePreview = `data:image/*;base64,${res.data.image}`
                }
            } catch (e) { /* no image — keep the placeholder */ }
        },
        onMemberPhoto(e) {
            const file = e.target.files[0]
            e.target.value = ''
            if (!file) return
            if (file.size > 4 * 1024 * 1024) {
                this.$emit('onErrorHandler', this.$t('msg.fileTooLarge'))
                return
            }
            // defer the real upload until Save — just stage the file + show a local preview
            this.pendingPhotoFile = file
            const reader = new FileReader()
            reader.onload = () => { this.editImagePreview = reader.result }
            reader.readAsDataURL(file)
        },
        // uploads the staged photo; returns true/false. No loading/toast here — saveEdit
        // wraps the whole combined save (photo + data) in one loading + one result message.
        async uploadMemberPhoto(file) {
            const studentid = this.edited.studentid
            const ext = file.name.split('.').pop()
            const renamedFile = new File([file], `${studentid}.${ext}`, { type: file.type })
            const formData = new FormData()
            formData.append('profileImage', renamedFile)
            formData.append('studentid', String(studentid))
            try {
                const token = this.$store.getters.getToken
                const response = await fetch(this.baseURL + '/uploadProfileImage', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                })
                const data = await response.json()
                if (data.url) {
                    const busted = this.$bustCache(data.url)   // S3 reuses the key → identical URL → cache-bust
                    this.editImagePreview = busted
                    const member = this.family.find(p => p.studentid === studentid)
                    if (member) member.profile_image_url = busted
                    return true
                }
                this.$emit('onErrorHandler', this.$t('msg.uploadFail'))
                return false
            } catch (e) {
                this.$emit('onErrorHandler', this.$t('msg.uploadFail'))
                return false
            }
        },
        async saveEdit() {
            this.$emit('onLoading', true)
            // 1) if the user changed the photo, upload it first (combined into this one Save)
            if (this.pendingPhotoFile) {
                const ok = await this.uploadMemberPhoto(this.pendingPhotoFile)
                if (!ok) { this.$emit('onLoading', false); return }
                this.pendingPhotoFile = null
            }
            // 2) then save the profile fields
            const token = this.$store.getters.getToken
            const user = JSON.parse(localStorage.getItem('userdata'))
            try {
                const res = await axios.post(this.baseURL + '/updateStudentByFamily', {
                    studentid: this.edited.studentid,
                    familyid: user.familyid,
                    firstname: this.edited.firstname,
                    middlename: this.edited.middlename,
                    lastname: this.edited.lastname,
                    nickname: this.edited.nickname,
                    gender: this.edited.gender,
                    dateofbirth: this.edited.dateofbirth,
                    school: this.edited.school,
                }, { headers: { Authorization: `Bearer ${token}` } })
                if (res.data && res.data.success) {
                    this.$emit('onInfoHandler', res.data.message || this.$t('family.editSuccess'))
                    this.editDialog = false
                    this.getFamilyList()
                } else {
                    this.$emit('onErrorHandler', (res.data && res.data.message) || this.$t('family.editFail'))
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                } else {
                    this.$emit('onErrorHandler', (error.response && error.response.data && error.response.data.message) || error.message)
                }
            }
            this.$emit('onLoading', false)
        },
        async deleteItemConfirm() {
            this.dialogDeleteNotify = false
            await this.deleteStudent()
        },
        closeDeleteNotify() {
            this.dialogDeleteNotify = false
        },
        onError(message) {
            this.$emit('onErrorHandler', message)
        },
        onShowInfoDialog(message) {
            this.$emit('onInfoHandler', message)
        }
    },
    created() {
        this.getFamilyList()
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

    }

}
</script>

<style scoped>
/* Round-clip the gender avatar image inside the tt-avatar circle. .tt-avatar
   forces flex:0 0 30px; re-assert a square 48px basis so overflow:hidden +
   border-radius:999px clip a real circle (not an ellipse). */
.fam-avatar {
    flex: 0 0 48px;
    overflow: hidden;
    padding: 0;
}

/* member card — flex column so the action row pins to the bottom of equal-height cards */
.fam-card {
    display: flex;
    flex-direction: column;
}

/* pending (journal === '1') members render slightly dimmed */
.fam-pending {
    opacity: 0.7;
}

.fam-actions {
    display: flex;
    gap: 8px;
    margin-top: auto;
    padding-top: 14px;
}

/* ghost delete button uses the error color for the trash icon */
.fam-del {
    color: var(--c-error);
    flex: 0 0 auto;
}

.fam-del .mdi {
    font-size: 20px;
}
</style>