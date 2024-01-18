<template>
    <div>
        <div v-if="!isAddFamily">
            <div class="container">
                <div class="container-header">
                    <h1><span class="mdi mdi-account-multiple"></span> Family</h1>
                </div>
                <div class="container-content">
                    <h3 class="group-header">Family member
                        <span class="mdi mdi-account-multiple-plus btn-add" @click="doAddFamilyMember"></span>
                    </h3>
                    <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                    <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
                    <v-table class="family-list">
                    <tbody>
                    <tr
                        v-for="people in family"
                        :key="people.childid"
                        style="cursor: pointer;"
                        class="tr-rows"
                    >
                        <td style="width: 20vw;">
                            <v-img
                                v-if="people.photo"
                                :src="people.photo"
                                cover
                                class="pa-4 bg-secondary rounded-circle d-inline-block"
                                style="display: flex !important;"
                            ></v-img>
                        </td>
                        <td style="width: 70vw;">{{ people.firstname + ' ' + people.lastname }}</td>
                        <td style="width: 10vw;"><span class="mdi mdi-delete-forever" style="font-size: 7vw;" @click="deleteFamily(people)"></span></td>
                    </tr>
                    </tbody>
                </v-table>
                </div>
            </div>
        </div>
        <div v-else>
            <AddFamily 
            @onClickChangeState="ChangeStateFamily($event)"
            @onBlackToFamilylist="ChangeStateFamily('list')"
            @onErrorHandler="onError($event)"
            @onInfoHandler="onShowInfoDialog($event)"
            ></AddFamily>
        </div>
    </div>
    <!-- <div v-else>
    <div class="container">
        <img src="../assets/logo/logo-2.png" alt="iStar Logo" class="istar-logo">
        <p>Please log in to access this page.</p>
        </div>
    </div> -->
</template>

<script>
import tokenService from '@/services/tokenService';
import { ref, computed, onMounted, inject } from 'vue';
import AddFamily from './AddFamily.vue'
import axios from 'axios';
export default {
    components: {
        AddFamily,
    },
    data() {
        return {
            isAddFamily: false,
            family: [
                // {
                //     childid: 1,
                //     familyid: 1,
                //     photo: 'https://as1.ftcdn.net/v2/jpg/01/16/24/44/1000_F_116244459_pywR1e0T3H7FPk3LTMjG6jsL3UchDpht.jpg',
                //     firstname: 'มณัญฌญา',
                //     lastname: 'จันทราพรไพลิน',
                //     nickname: 'ไอซ์',
                //     gender: 'หญิง',
                //     age: '10',
                //     coursename: 'iStar',
                //     remaining: 1
                // },
                // {
                //     childid: 2,
                //     familyid: 1,
                //     photo: 'https://creazilla-store.fra1.digitaloceanspaces.com/icons/7912642/avatar-icon-md.png',
                //     firstname: 'ธนา',
                //     lastname: 'ผโลดม',
                //     nickname: 'บุช',
                //     gender: 'ชาย',
                //     age: '12',
                //     coursename: 'G.A.',
                //     remaining: 2
                // },
                // {
                //     childid: 3,
                //     familyid: 1,
                //     photo: 'https://cdn.icon-icons.com/icons2/2643/PNG/512/female_woman_person_people_avatar_icon_159366.png',
                //     firstname: 'ธนภรณ์',
                //     lastname: 'อุทัยศรี',
                //     nickname: 'อีฟ',
                //     gender: 'หญิง',
                //     age: '11',
                //     coursename: 'G.A.',
                //     remaining: 3,
                // },
            ],
        }
    },
    methods: {
        doAddFamilyMember() {
          this.$emit('onClickChangeState', 'addfamilymember')
          this.$emit('initBack', 'familylist')
      },
        ChangeStateFamily(state) {
            this.stateFamily = state
            if(state == 'add') {
                this.isAddFamily = true
            } else if(state == 'list') {
                this.getFamilyMember()
                this.isAddFamily = false
            }
        },
        async getFamilyMember() {
            const user = JSON.parse(localStorage.getItem('userdata'))
            await axios
            .post(this.baseURL+'/getFamilyMember', {
                familyid: user.familyid,
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.family = response.data.results
                } else {
                    this.family = []
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
        async deleteFamily(people) {
            axios.post(this.baseURL+'/deleteFamilyMember', {
                familyid: people.familyid,
                childid: people.childid,
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'Delete Family Member Successful');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'Get Family Member failed');
                }
                this.getFamilyMember()
            })
        },
        onError(message) {
            this.$emit('onErrorHandler', message)
        },
        onShowInfoDialog(message) {
            this.$emit('onInfoHandler', message)
        }
    },
    setup() {
        const isAuthenticated = computed(() => !!localStorage.getItem('token'));
        console.log(isAuthenticated.value)
        return { isAuthenticated };
    },
    created() {
        this.getFamilyMember()
    }

}
</script>

<style>
.family-list {
    font-size:  3.1vw;
    width: 100%;
}
.btn-add {
    float: right;
    box-shadow: 0 0 0 0;
    margin-bottom: 2vh;
    height: 25px;
    font-size: larger;
}
</style>