<template>
    <div>
        <div v-if="!isAddFamily">
            <div class="container">
                <div class="container-header">
                    <h1><span class="mdi mdi-account-multiple"></span> Family</h1>
                </div>
                <div class="container-content">
                    <h3 class="group-header">Family member</h3>
                    <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                    <v-divider color="#fffff" thickness="3"></v-divider>
                    <v-table class="family-list">
                        <tbody>
                            <tr v-for="people in family" :key="people.studentid" style="cursor: pointer; "
                                :class="{ 'highlight-row': people.journal === '1' }" class="tr-rows">
                                <td style="width: 20vw;">
                                    <v-img v-if="people.gender === 'หญิง'" :src="profileGirl" cover
                                        class="pa-4 bg-secondary rounded-circle d-inline-block"
                                        style="display: flex !important;"></v-img>
                                    <v-img v-else :src="profileBoy" cover
                                        class="pa-4 bg-secondary rounded-circle d-inline-block"
                                        style="display: flex !important;"></v-img>
                                </td>
                                <td style="width: 70vw;">{{ people.fullname }}</td>
                                <td v-if="people.journal === '1' " style="width: 10vw;"><span class="mdi mdi-delete-forever" style="font-size: 7vw; color: red;"
                                        @click="onClickDelete(people)"></span></td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align: center; padding-top: 5vh;">
                                    <!-- ปุ่มที่มีไอคอนด้านซ้าย พร้อมด้วยสีสัน รูปร่าง และเอฟเฟค pulse -->
                                    <v-btn color="success" elevation="2" rounded class="ma-2 pulse-button" @click="doAddFamilyMember">
                                    <v-icon left>mdi-account-multiple-plus</v-icon>
                                    &nbsp;Add Family Member
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
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
                <v-btn color="#4CAF50" variant="tonal" @click="deleteItemConfirm">ตกลง</v-btn>
                <v-btn color="#F44336" variant="tonal" @click="closeDeleteNotify">ยกเลิก</v-btn>

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
            this.deleteNotifyMsg = `คุณต้องการลบ ${people.fullname} ออกจากครอบครัวใช่หรือไม่?`
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

<style>
.family-list {
    font-size: 3.1vw;
    width: 100%;
}

.btn-add {
    float: right;
    box-shadow: 0 0 0 0;
    margin-bottom: 2vh;
    height: 25px;
    font-size: larger;
}

.highlight-row {
    color: #80808059;
}

/* สไตล์เพิ่มเติมสำหรับปุ่ม */
.v-btn {
  font-weight: bold;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* คีย์เฟรมสำหรับเอฟเฟค pulse */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* คลาสสำหรับปุ่มที่มีเอฟเฟค pulse */
.pulse-button {
  animation: pulse 1.5s infinite;
}
</style>