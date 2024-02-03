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
    <v-card
        v-if="loading"
        class="card-loading mx-auto text-center pt-5"
        elevation="24"
        height="150"
        width="150"
    >
        <v-card-title>
        <trinity-rings-spinner
            :animation-duration="1500"
            :size="66"
            color="#ff1d5e"
            class="mx-auto"
        />
        </v-card-title>
        <v-card-text style="color:#ff1d5e;" class="mx-auto">Loading...</v-card-text>
    </v-card>
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
        TrinityRingsSpinner
    },
    data() {
        return {
            loading: false,
            isAddFamily: false,
            family: [],
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
            this.loading = true
            const token = this.$store.getters.getToken;
            const user = JSON.parse(localStorage.getItem('userdata'))
            await axios
            .post(this.baseURL+'/getFamilyMember', {
                familyid: user.familyid,
            },
            { 
                headers:{ Authorization: `Bearer ${token}`, } 
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
            this.loading = false
        },
        async deleteFamily(people) {
            const token = this.$store.getters.getToken;
            axios.post(this.baseURL+'/deleteFamilyMember', {
                familyid: people.familyid,
                childid: people.childid,
            },
            { 
                headers:{ Authorization: `Bearer ${token}`, } 
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
    created() {
        this.getFamilyMember()
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
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