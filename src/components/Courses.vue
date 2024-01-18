<template>
  <div class="container">
    <div class="container-header">
        <h1><span class="mdi mdi-star-shooting-outline"></span> Courses Management</h1>
    </div>
    <div class="container-content">
    <v-data-table
      :headers="headers"
      :items="courselist"
      :sort-by="[{ key: 'coursename', order: 'asc' }]"
    >
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>Our Courses</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                color="primary"
                dark
                v-bind="props"
              >
                New Course
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span>{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                      sm="6"
                      md="50"
                    >
                      <v-text-field
                        v-model="editedItem.coursename"
                        label="Course Name"
                        variant="solo-filled"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="50"
                    >
                      <v-text-field
                        v-model="editedItem.course_shortname"
                        label="Course Short Name"
                        variant="solo-filled"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
  
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="save"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" persistent width="auto">
            <v-card>
                <v-card-title></v-card-title>
                <v-card-text>ต้องการลบคอร์สเรียนนี้จริงๆหรอ ?</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="#4CAF50" variant="tonal" @click="deleteItemConfirm">ใช่! ลบเลย</v-btn>
                <v-btn color="#F44336" variant="tonal" @click="closeDelete">ไม่ลบละ เปลี่ยนใจ</v-btn>
                
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          size="small"
          class="me-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          size="small"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn
          color="primary"
          @click="initialize"
        >
          Reset
        </v-btn>
      </template>
    </v-data-table>
    </div>
  </div>
  </template>
  <script>
  import axios from 'axios'
    export default {
      data: () => ({
        dialog: false,
        dialogDelete: false,
        headers: [
          { title: 'Course Name', align: 'start', key: 'coursename' },
          { title: 'Course Short Name', key: 'course_shortname' },
          { title: 'Actions', key: 'actions', sortable: false },
        ],
        editedIndex: -1,
        editedItem: {
          coursename: '',
          course_shortname: '',
        },
        defaultItem: {
          coursename: '',
          course_shortname: '',
        },
        courselist: [],
      }),
  
      computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'New Course' : 'Edit Course'
        },
      },
  
      watch: {
        dialog (val) {
          val || this.close()
        },
        dialogDelete (val) {
          val || this.closeDelete()
        },
      },
  
      created () {
        this.initialize()
      },
  
      methods: {
         initialize () {
             axios
            .get(this.baseURL+'/getAllCourses', {})
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.courselist = response.data.results
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
  
        editItem (item) {
          this.editedIndex = this.courselist.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialog = true
        },
  
        deleteItem (item) {
          this.editedIndex = this.courselist.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialogDelete = true
        },
  
        deleteItemConfirm () {
          axios
            .post(this.baseURL+'/deleteCourse', {
              courseid: this.editedItem.courseid
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'สำเร็จ ระเบิดคลาสนี้สมดั่งใจคุณแล้ว');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'เสียใจ ลบไม่ได้ ลองใหม่อีกครั้งนะ');
                }
                this.initialize()
            })
            .catch(error => {
                console.error(error);
            });
          this.closeDelete()
        },
  
        close () {
          this.dialog = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },
  
        closeDelete () {
          this.dialogDelete = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },
  
        save () {
          if (this.editedIndex > -1) {
            let saveObj = {
                courseid: this.editedItem.courseid,
                coursename: this.editedItem.coursename,
                course_shortname: this.editedItem.course_shortname,
            }
            axios
            .post(this.baseURL+'/updateCourse', saveObj)
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'สำเร็จ แก้ไขข้อมูลคอร์สแล้ว');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'เสียใจ แก้ไขไม่ได้ ลองใหม่อีกครั้งนะ');
                }
                this.initialize()
            })
          } else {
            let saveObj = {
                coursename: this.editedItem.coursename,
                course_shortname: this.editedItem.course_shortname,
            }
            axios
            .post(this.baseURL+'/addCourse', saveObj)
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'สำเร็จ สร้างคอร์สใหม่แล้ว');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'เสียใจ สร้างคอร์สไม่ได้ ลองใหม่อีกครั้งนะ');
                }
                this.initialize()
            })
          }
          this.close()
        },
      },
    }
  </script>