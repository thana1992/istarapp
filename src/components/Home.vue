<template>
<div class="container">
  <div v-if="isLoggedIn">
      <div class="container-header">
          <h1><font-awesome-icon icon="fa-solid fa-house-user" /> Home</h1>
      </div>
      <div v-if="familylist">
        <div class="container-content">
          <h3 class="group-header">Family</h3>
          <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
          <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
          <div class="familylist">
            <v-table class="family-list">
                <tbody>
                <tr
                    v-for="p in familylist"
                    :key="p.childid"
                    style="cursor: pointer;"
                    class="tr-rows"
                    @click="selectChild(p)"
                >
                    <td style="width: 20vw;">
                        <v-img
                            :src="p.photo"
                            cover
                            class="pa-4 bg-secondary rounded-circle d-inline-block"
                            style="display: flex !important;"
                        ></v-img>
                    </td>
                    <td style="width: 70vw;"><p>{{ p.firstname + ' ' + p.lastname }}</p></td>
                    <td style="width: 10vw;"><p>{{ p.course_shortname }}</p></td>
                </tr>
                </tbody>
            </v-table>
          </div>
        </div>
          <div class="container-content">
              <h3 class="group-header">Information</h3>
              <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
              <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
              <div class="information">
                  <Transition v-for="p in familylist">
                      <div v-if="p.childid == childid">
                          <div class="info-photo" >
                              <v-img
                                  :src="p.photo"
                                  cover
                                  class="pa-6 bg-secondary rounded-circle d-inline-block"
                                  style="display: flex !important; max-width: 25vw;"
                              ></v-img>   
                          </div>
                          <div class="info-detail">
                              <p>{{ p.firstname + ' ' + p.lastname }} ({{ p.nickname }})</p>
                              <p>เพศ {{ p.gender }} อายุ {{ calculateAge(p.dateofbirth) }}</p>
                              <p>Course {{ p.coursename }} </p>
                              <p>เหลือ {{ p.remaining }} ครั้ง</p>
                          </div>
                      </div>
                  </Transition>
              </div>
          </div>
          <Transition>
              <div class="container-content">
                  <h3 class="group-header">Reservation 
                      <span class="mdi mdi-calendar-plus btn-reserve" @click="doReservation"></span>
                  </h3>
                  <v-divider class="border-opacity-100" color="info" length="35vw" thickness="3"></v-divider>
                  <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
                  
                  <Transition v-if="memberReservationDetail" >
                      <v-table class="family-list">
                          <thead>
                              <tr>
                                  <!-- <th class="text-left">No.</th> -->
                                  <th class="text-left">Date</th>
                                  <th class="text-left">Class Time</th>
                              </tr>
                          </thead>
                          
                          <tbody>
                              <tr
                                  v-for="item in memberReservationDetail"
                                  :key="item.childid"
                                  class="tr-rows"
                              >
                                  <!-- <td>{{ item.no }}</td> -->
                                  <td>{{ format_date(item.classdate) }}</td>
                                  <td>{{ item.classtime }}</td>
                              </tr>
                          </tbody>
                      </v-table>
                  </Transition>
              </div>
          </Transition>
        </div>
      
      <div v-else>
        <p>Please Add your family member</p>
      </div>
    </div>
  <div v-else>
    <p>Please Logon to access this page</p>
  </div>
</div>
</template>

<script>
import tokenService from '@/services/tokenService';
import { VBottomNavigation, VBottomSheet } from 'vuetify/lib/components/index.mjs'
import { ref, computed, onMounted, inject } from 'vue';
import axios from 'axios';
import moment from 'moment'
export default {
  setup() {
      const isAuthenticated = computed(() => !!localStorage.getItem('token'));
      console.log(isAuthenticated.value)

      return { isAuthenticated };
  },
  components: {
      VBottomNavigation,
      VBottomSheet,
  },
  methods: {
      selectChild(student) {
          console.log(student)
          this.childid = student.childid
          this.studentSelected = student
          this.getReservationDetail(student.childid)
      },
      doReservation() {
        if(this.studentSelected == null) {
            this.$emit('onErrorHandler', 'Please select any one of your family')
            return
        }
        if(this.studentSelected.remaining <= 0) {
            this.$emit('onErrorHandler', 'ไม่สามารถจองคลาสได้ จำนวนคลาสของท่านหมดแล้ว T-T')
            return;
        }
        this.$emit('collectData', this.studentSelected)
        this.$emit('onClickChangeState', 'reservation')
        this.$emit('initBack', 'home')
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
                  this.familylist = response.data.results
              }
          })
          .catch(error => {
              console.error(error);
          });
      },
      async getReservationDetail(childid) {
          const user = JSON.parse(localStorage.getItem('userdata'))
          await axios
          .post(this.baseURL+'/getMemberReservationDetail', {
              childid: childid,
          })
          .then(response => {
              console.dir(response);
              if (response.data.success) {
                  this.memberReservationDetail = response.data.results
              } else {
                  this.memberReservationDetail = []
              }
          })
          .catch(error => {
              console.error(error);
          });
      },
      format_date(value){
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

      }
  },
  props: {
      student: {
          type: Object,
          default: null,
      },
  },
  async created() {
      await this.getFamilyMember()
      if(this.student != null) {
        this.selectChild(this.student)
      }

      this.isLoggedIn = tokenService.isLoggedIn();
  },
  data() {
      return {
          isLoggedIn: false,
          familylist: null,
          userdetail: null,
          memberReservationDetail: null,
          studentSelected: null,
          childid: null,
          clickReservation: false,
          headers: [
              { title: 'Date', align:'start', key: 'classdate' },
              { title: 'Class Time', align:'start', key: 'classtime' },
          ],
      };
  },
  mounted() {
    this.isLoggedIn = tokenService.isLoggedIn();
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
  font-size:  3.1vw;
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