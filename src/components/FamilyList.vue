<template>
    <div v-if="!isAddFamily">
        <div class="container">
            <div class="container-header">
                <h1><span class="mdi mdi-account-multiple"></span> Family</h1>
            </div>
            <div class="container-content">
                <h3 class="group-header">Family list
                    <span class="mdi mdi-account-multiple-plus btn-add" @click="ChangeStateFamily('add')"></span>
                </h3>
                <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
                <v-table class="family-list">
                <tbody>
                <tr
                    v-for="people in family"
                    :key="people.name"
                    style="cursor: pointer;"
                    class="tr-rows"
                >
                    <td>
                        <v-img
                            :src="people.photo"
                            cover
                            class="pa-4 bg-secondary rounded-circle d-inline-block"
                            style="display: flex !important;"
                        ></v-img>
                    </td>
                    <td>{{ people.name }}</td>
                    <td><span class="mdi mdi-delete-forever" style="font-size: 7vw;" @click="deleteFamily(people)"></span></td>
                </tr>
                </tbody>
            </v-table>
            </div>
        </div>
    </div>
    <div v-else>
        <AddFamily @onClickChangeState="ChangeStateFamily($event)"></AddFamily>
    </div>
</template>

<script>
import AddFamily from './AddFamily.vue'
export default {
    components: {
        AddFamily,
    },
    data() {
        return {
            isAddFamily: false,
            family: [
                {
                    photo: 'https://as1.ftcdn.net/v2/jpg/01/16/24/44/1000_F_116244459_pywR1e0T3H7FPk3LTMjG6jsL3UchDpht.jpg',
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
                    photo: 'https://creazilla-store.fra1.digitaloceanspaces.com/icons/7912642/avatar-icon-md.png',
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
                    photo: 'https://cdn.icon-icons.com/icons2/2643/PNG/512/female_woman_person_people_avatar_icon_159366.png',
                    name: 'ธนภรณ์ อุทัยศรี',
                    nickname: 'อีฟ',
                    gender: 'หญิง',
                    age: '11',
                    course: 'G.A.',
                    remaining: 3,
                },
            ],
        }
    },
    methods: {
        ChangeStateFamily(state) {
            this.stateFamily = state
            if(state == 'add') {
                this.isAddFamily = true
            } else if(state == 'list') {
                this.isAddFamily = false
            }
        },
        deleteFamily(people) {
            alert("delete : " + people.name)
        }
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