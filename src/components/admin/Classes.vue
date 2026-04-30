<template>
  <div class="container">
    <div class="container-header">
      <h1><span class="mdi mdi-view-dashboard-variant-outline"></span> {{ $t('classes.title') }}</h1>
    </div>
    <div class="container-content">
      <v-card class="mx-auto mt-5 card-opacity">
        <v-data-table :headers="headers" :items="classlist" :sort-by="[{ key: 'coursename', order: 'asc' }]"
          :loading="loadingClasses">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>{{ $t('classes.ourClasses') }}</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" dark v-bind="props">
                    {{ $t('classes.newClass') }}
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
                          <v-select v-model="editedItem.courseid" :label="$t('table.courseName')" item-title="coursename"
                            item-value="courseid" :items="courseLookup" variant="solo-filled"
                            no-data-text="No course data" required></v-select>
                        </v-col>
                        <v-col cols="12" sm="6" md="50">
                          <v-text-field v-model="editedItem.classday" :label="$t('table.classDay')"
                            variant="solo-filled"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="50">
                          <v-text-field v-model="editedItem.classtime" :label="$t('table.classTime')"
                            variant="solo-filled"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="50">
                          <v-text-field v-model="editedItem.maxperson" :label="$t('table.maxStudent')"
                            variant="solo-filled"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="50">
                          <v-text-field v-model="editedItem.adminflag" :label="$t('table.adminFlag')"
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
                  <v-card-text>{{ $t('classes.confirmDelete') }}</v-card-text>
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
    loadingClasses: false,
    editedIndex: -1,
    editedItem: {
      classday: '',
      classtime: '',
      maxperson: 0,
      adminflag: 0,
    },
    defaultItem: {
      classday: '',
      classtime: '',
      maxperson: 20,
      adminflag: 0,
    },
    classlist: [],
    courseLookup: [],
  }),

  computed: {
    ...mapGetters({
      token: 'getToken',
    }),
    formTitle() {
      return this.editedIndex === -1 ? this.$t('classes.newClass') : this.$t('classes.editClass')
    },
    headers() {
      return [
        { title: this.$t('table.courseName'), align: 'start', key: 'coursename' },
        { title: this.$t('table.classDay'), key: 'classday' },
        { title: this.$t('table.classTime'), key: 'classtime' },
        { title: this.$t('table.maxStudent'), key: 'maxperson' },
        { title: this.$t('table.adminFlag'), key: 'adminflag' },
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

  async created() {
    this.$emit('onLoading', true)
    await this.initialize()

    this.$emit('onLoading', false)
  },

  methods: {
    async initialize() {
      this.$emit('onLoading', true)
      this.loadingClasses = true
      const token = this.$store.getters.getToken;
      await axios
        .get(this.baseURL + '/getAllClasses',
          {
            headers: { Authorization: `Bearer ${token}`, }
          })
        .then(response => {
          //console.dir(response);
          if (response.data.success) {
            this.classlist = response.data.results
          }
          this.loadingClasses = false
        })
        .catch(error => {
          this.loadingClasses = false
          //console.error(error);
        });
      await this.getCourseLookup()
      this.$emit('onLoading', false)
    },

    async getCourseLookup() {
      const token = this.$store.getters.getToken;
      await axios
        .get(this.baseURL + '/courseLookup',
          {
            headers: { Authorization: `Bearer ${token}`, }
          })
        .then(response => {
          //console.dir(response);
          if (response.data.success) {
            this.courseLookup = response.data.results
          }
        })
        .catch(error => {
          //console.error(error);
        });
    },

    editItem(item) {
      this.editedIndex = this.classlist.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem(item) {
      this.editedIndex = this.classlist.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    async deleteItemConfirm() {
      this.$emit('onLoading', true)
      const token = this.$store.getters.getToken;
      await axios
        .post(this.baseURL + '/deleteClass', {
          classid: this.editedItem.classid
        },
          {
            headers: { Authorization: `Bearer ${token}`, }
          })
        .then(response => {
          //console.dir(response);
          if (response.data.success) {
            this.$emit('onInfoHandler', this.$t('msg.classDeleted'));
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
      this.$emit('onLoading', true)
      const token = this.$store.getters.getToken;
      if (this.editedIndex > -1) {
        let saveObj = {
          classid: this.editedItem.classid,
          courseid: this.editedItem.courseid,
          classday: this.editedItem.classday,
          classtime: this.editedItem.classtime,
          maxperson: this.editedItem.maxperson,
          adminflag: this.editedItem.adminflag
        }
        await axios
          .post(this.baseURL + '/updateClass', saveObj,
            {
              headers: { Authorization: `Bearer ${token}`, }
            })
          .then(response => {
            //console.dir(response);
            if (response.data.success) {
              this.$emit('onInfoHandler', this.$t('msg.classUpdated'));
            } else {
              this.$emit('onErrorHandler', response.data.message || this.$t('msg.updateFail'));
            }
            this.initialize()
          })
      } else {
        let saveObj = {
          courseid: this.editedItem.courseid,
          classday: this.editedItem.classday,
          classtime: this.editedItem.classtime,
          maxperson: this.editedItem.maxperson,
          adminflag: this.editedItem.adminflag
        }
        await axios
          .post(this.baseURL + '/addClass', saveObj,
            {
              headers: { Authorization: `Bearer ${token}`, }
            })
          .then(response => {
            //console.dir(response);
            if (response.data.success) {
              this.$emit('onInfoHandler', this.$t('msg.classCreated'));
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