<template>
    <div class="container-header">
        <h1><span class="mdi mdi-gymnastics"></span> Classes Management</h1>
    </div>
    <div class="container-content">
    <v-data-table
      :headers="headers"
      :items="coursename"
      :sort-by="[{ key: 'coursename', order: 'asc' }]"
    >
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>Our Classes</v-toolbar-title>
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
                class="mb-2"
                v-bind="props"
              >
                New Class
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
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
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="50"
                    >
                      <v-text-field
                        v-model="editedItem.classday"
                        label="Class Day"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="50"
                    >
                      <v-text-field
                        v-model="editedItem.classtime"
                        label="Class Time"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="50"
                    >
                      <v-text-field
                        v-model="editedItem.maxperson"
                        label="Max Student"
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
                <v-card-text>ต้องการลบคลาสเรียนนี้จริงๆหรอ ? การจองทั้งหมดที่มีอยู่ในคลาสนี้ก็จะถูกยกเลิกด้วยนะ</v-card-text>
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
  </template>
  <script>
  import axios from 'axios'
    export default {
      data: () => ({
        dialog: false,
        dialogDelete: false,
        headers: [
          {
            title: 'Course Name',
            align: 'start',
            key: 'coursename',
          },
          { title: 'Class Day', key: 'classday' },
          { title: 'Class Time', key: 'classtime' },
          { title: 'Max student', key: 'maxperson' },
          { title: 'Actions', key: 'actions', sortable: false },
        ],
        editedIndex: -1,
        editedItem: {
            classday: '',
            classtime: '',
            maxperson: 0,
        },
        defaultItem: {
            classday: '',
            classtime: '',
            maxperson: 20,
        },
        coursename: [],
      }),
  
      computed: {
        formTitle () {
          return this.editedIndex === -1 ? 'New Class' : 'Edit Class'
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
            .post('http://localhost:3000/getAllClasses', {})
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.coursename = response.data.results
                }
            })
            .catch(error => {
                console.error(error);
            });
        },
  
        editItem (item) {
          this.editedIndex = this.coursename.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialog = true
        },
  
        deleteItem (item) {
            alert(item.classid)
          this.editedIndex = this.coursename.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialogDelete = true
        },
  
        deleteItemConfirm () {
          axios
            .post('http://localhost:3000/deleteClass', {
                classid: this.editedItem.classid
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
            Object.assign(this.coursename[this.editedIndex], this.editedItem)
          } else {
            axios
            .post('http://localhost:3000/addClass', {
                courseid: this.editedItem.courseid,
                coursename: this.editedItem.coursename,
                classday: this.editedItem.classday,
                classtime: this.editedItem.classtime,
                maxperson: this.editedItem.maxperson,
            })
            .then(response => {
                console.dir(response);
                if (response.data.success) {
                    this.$emit('onInfoHandler', 'สำเร็จ สร้างคลาสใหม่แล้ว');
                } else {
                    this.$emit('onErrorHandler', response.data.message || 'เสียใจ สร้างคลาสไม่ได้ ลองใหม่อีกครั้งนะ');
                }
                this.initialize()
            })
          }
          this.close()
        },
      },
    }
  </script>