<template>
  <div class="container">
    <div class="container-header">
      <h1><span class="mdi mdi-star-shooting-outline"></span> {{ $t('courses.title') }}</h1>
    </div>
    <div class="container-content">
      <v-card class="mx-auto mt-5 card-opacity">
        <v-data-table :headers="headers" :items="courselist" :sort-by="[{ key: 'coursename', order: 'asc' }]"
          :loading="loadingCourses">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>{{ $t('courses.ourCourses') }}</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" dark v-bind="props">
                    {{ $t('courses.newCourse') }}
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span>{{ formTitle }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6" md="50">
                          <v-text-field v-model="editedItem.coursename" :label="$t('table.courseName')"
                            variant="solo-filled"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="50">
                          <v-text-field v-model="editedItem.course_shortname" :label="$t('table.courseShortName')"
                            variant="solo-filled"></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="close">
                      {{ $t('btn.cancel') }}
                    </v-btn>
                    <v-btn color="blue-darken-1" variant="text" @click="save">
                      {{ $t('btn.save') }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDelete" persistent width="auto">
                <v-card>
                  <v-card-title></v-card-title>
                  <v-card-text>{{ $t('courses.confirmDelete') }}</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="#4CAF50" variant="tonal" @click="deleteItemConfirm">{{ $t('btn.ok') }}</v-btn>
                    <v-btn color="#F44336" variant="tonal" @click="closeDelete">{{ $t('btn.cancel') }}</v-btn>

                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon size="small" class="me-2" @click="editItem(item)">
              mdi-pencil
            </v-icon>
            <v-icon size="small" @click="deleteItem(item)">
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:no-data>
            <v-btn color="primary" @click="initialize">
              Reset
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import { mapGetters } from 'vuex';

export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    loadingCourses: false,
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
    ...mapGetters({
      token: 'getToken',
    }),
    formTitle() {
      return this.editedIndex === -1 ? this.$t('courses.newCourse') : this.$t('courses.editCourse')
    },
    headers() {
      return [
        { title: this.$t('table.courseName'), align: 'start', key: 'coursename' },
        { title: this.$t('table.courseShortName'), key: 'course_shortname' },
        { title: this.$t('table.actions'), key: 'actions', sortable: false },
      ]
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },

  created() {
    this.initialize()
  },

  methods: {
    async initialize() {
      this.$emit('onLoading', true)
      this.loadingCourses = true;
      const token = this.$store.getters.getToken;
      await axios
        .get(this.baseURL + '/getAllCourses',
          {
            headers: { Authorization: `Bearer ${token}`, }
          })
        .then(response => {
          //console.dir(response);
          if (response.data.success) {
            this.courselist = response.data.results
          }
          this.loadingCourses = false;
        })
        .catch(error => {
          //console.error(error);
          this.loadingCourses = false
        });
      this.$emit('onLoading', false)
    },

    editItem(item) {
      this.editedIndex = this.courselist.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.courselist.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    async deleteItemConfirm() {
      const token = this.$store.getters.getToken;
      this.$emit('onLoading', true)
      await axios
        .post(this.baseURL + '/deleteCourse', {
          courseid: this.editedItem.courseid
        },
          {
            headers: { Authorization: `Bearer ${token}`, }
          })
        .then(response => {
          //console.dir(response);
          if (response.data.success) {
            this.$emit('onInfoHandler', this.$t('msg.deleted'));
          } else {
            this.$emit('onErrorHandler', response.data.message || this.$t('msg.updateFail'));
          }
          this.initialize()
        })
        .catch(error => {
          //console.error(error);
        });
      this.closeDelete()
      this.$emit('onLoading', false)
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save() {
      const token = this.$store.getters.getToken;
      this.$emit('onLoading', true)
      if (this.editedIndex > -1) {
        let saveObj = {
          courseid: this.editedItem.courseid,
          coursename: this.editedItem.coursename,
          course_shortname: this.editedItem.course_shortname,
        }
        await axios
          .post(this.baseURL + '/updateCourse', saveObj,
            {
              headers: { Authorization: `Bearer ${token}`, }
            })
          .then(response => {
            //console.dir(response);
            if (response.data.success) {
              this.$emit('onInfoHandler', this.$t('msg.courseUpdated'));
            } else {
              this.$emit('onErrorHandler', response.data.message || this.$t('msg.updateFail'));
            }
            this.initialize()
          })
      } else {
        let saveObj = {
          coursename: this.editedItem.coursename,
          course_shortname: this.editedItem.course_shortname,
        }
        await axios
          .post(this.baseURL + '/addCourse', saveObj,
            {
              headers: { Authorization: `Bearer ${token}`, }
            })
          .then(response => {
            //console.dir(response);
            if (response.data.success) {
              this.$emit('onInfoHandler', this.$t('msg.courseCreated'));
            } else {
              this.$emit('onErrorHandler', response.data.message || this.$t('msg.addFail'));
            }
            this.initialize()
          })
      }
      this.close()
      this.$emit('onLoading', false)
    },
  },
}
</script>