<template>
    <div>
        <div v-if="!isAddFamily">
            <div class="container">
                <div class="container-header">
                    <h1><span class="mdi mdi-account-multiple"></span> {{ $t('family.title') }}</h1>
                </div>
                <div class="container-content">
                    <v-card class="card-opacity family-card">
                        <div class="section-header">
                            <span class="mdi mdi-account-group"></span> {{ $t('family.sectionHeader') }}
                        </div>
                        <v-table class="family-list">
                            <tbody>
                                <tr v-for="people in family" :key="people.studentid"
                                    :class="{ 'highlight-row': people.journal === '1' }" class="tr-rows">
                                    <td class="td-avatar">
                                        <div class="avatar-wrap">
                                            <v-img :src="people.gender === 'หญิง' ? profileGirl : profileBoy"
                                                   cover width="46" height="46"></v-img>
                                        </div>
                                    </td>
                                    <td class="td-name">{{ people.fullname }}</td>
                                    <td v-if="people.journal === '1'" class="td-action">
                                        <span class="mdi mdi-delete-forever delete-icon"
                                              @click="onClickDelete(people)"></span>
                                    </td>
                                    <td v-else class="td-action"></td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                    <div class="below-card-actions">
                        <v-btn class="pulse-button neu-action-btn" size="large" @click="doAddFamilyMember">
                            <v-icon left>mdi-account-multiple-plus</v-icon>
                            &nbsp;{{ $t('family.addMember') }}
                        </v-btn>
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
import { ref, computed, onMounted, inject } from 'vue';
import AddFamily from './AddFamily.vue'
import axios from 'axios';
import { mapGetters } from 'vuex';
import { TrinityRingsSpinner } from 'epic-spinners'
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
                .catch(error => {
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
                        this.$emit('onInfoHandler', 'Delete Family Member Successful');
                    } else {
                        this.$emit('onErrorHandler', response.data.message || 'Get Family Member failed');
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
.family-card {
    width: 100%;
}

/* Section header band — matches Home.vue style */
.section-header {
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

.section-header .mdi {
    color: #6366f1;
    font-size: 15px;
}

.family-list {
    font-size: clamp(13px, 3.1vw, 16px);
    width: 100%;
    background: transparent !important;
}

.tr-rows {
    cursor: pointer;
}

.td-avatar {
    width: 64px;
    padding: 10px 12px;
}

.avatar-wrap {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    overflow: hidden;
    background: #e0e5ec;
}

.td-name {
    padding: 10px 8px;
}

.td-action {
    width: 48px;
    text-align: center;
    padding: 10px 8px;
}

.delete-icon {
    font-size: clamp(22px, 6vw, 30px);
    color: #ef4444;
    cursor: pointer;
}

.highlight-row {
    color: #80808059;
}

.below-card-actions {
    display: flex;
    justify-content: center;
    padding: 16px 0 8px;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.pulse-button {
    animation: pulse 1.5s infinite;
}
</style>