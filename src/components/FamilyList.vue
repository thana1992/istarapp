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

            <div class="scard" style="padding:0">
                <div v-for="people in family" :key="people.studentid"
                    class="row family-row"
                    :class="{ 'highlight-row': people.journal === '1' }"
                    style="justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--c-border)">
                    <div class="row" style="gap:12px">
                        <span class="tt-avatar fam-avatar"
                            style="width:46px;height:46px;font-size:17px;background:var(--c-primary)">
                            <v-img :src="people.gender === 'หญิง' ? profileGirl : profileBoy"
                                cover width="46" height="46"></v-img>
                        </span>
                        <div class="col" style="gap:1px">
                            <span class="strong" style="font-size:16px">{{ people.fullname }}</span>
                            <span class="t-cap">{{ people.gender }}</span>
                        </div>
                    </div>
                    <div class="row" style="gap:10px">
                        <span class="badge" :class="people.journal === '1' ? 'badge-warning' : 'badge-success'">
                            <span class="mdi"
                                :class="people.journal === '1' ? 'mdi-clock-outline' : 'mdi-check-circle-outline'"></span>
                        </span>
                        <button v-if="people.journal === '1'" class="id-btn id-btn-ghost id-btn-sm fam-del"
                            @click="onClickDelete(people)">
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
    
    <v-dialog v-model="dialogDeleteNotify" persistent width="auto">
        <v-card>
            <v-card-title></v-card-title>
            <v-card-text>{{ deleteNotifyMsg }}</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="#4CAF50" variant="tonal" @click="deleteItemConfirm">{{ $t('btn.ok') }}</v-btn>
                <v-btn color="#F44336" variant="tonal" @click="closeDeleteNotify">{{ $t('btn.cancel') }}</v-btn>

                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
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
/* Round-clip the gender avatar image inside the tt-avatar circle.
   .tt-avatar sets flex:0 0 30px, which (in the flex row) overrides the inline
   width:46px and squashes the box to 30×46 — an ellipse. Re-assert a square
   46px basis so overflow:hidden + border-radius:999px clip a real circle. */
.fam-avatar {
    flex: 0 0 46px;
    overflow: hidden;
    padding: 0;
}

.family-row:last-child {
    border-bottom: none !important;
}

/* Pending (journal === '1') members render dimmed, matching the original */
.highlight-row {
    opacity: 0.6;
}

/* Ghost delete button uses the error color for the trash icon */
.fam-del {
    color: var(--c-error);
    padding: 0 10px;
}

.fam-del .mdi {
    font-size: 20px;
}
</style>