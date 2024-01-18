<template>
    <v-data-table
      v-model="selected"
      :items="newStudentList"
      item-value="fullname"
      show-select
    ></v-data-table>
  </template>

<script>
import axios from 'axios'
  export default {
    data () {
      return {
        selected: [],
        newStudentList: [],
      }
    },
    methods: {
      getNewStudentList() {
        axios.get(this.baseURL+'/getNewStudentList')
        .then(response => {
            console.log('newstudent : ',response)
          this.newStudentList = response.data.results
        })
        .catch(error => {
          console.log(error)
        })
      },
      approveNewStudent() {
        axios.post(this.baseURL+'/approveFamilyMember', {
          newStudentList: this.newStudentList
        })
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
      }
    },
    created() {
      this.getNewStudentList()
    },
    destroyed(){
        console.log('destroyed...'+new Date())
    },
  }
</script>
