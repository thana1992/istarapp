<!-- ============================================================
  Classes.vue — NEW DESIGN 1:1 (iStar).
  • <script> = UNCHANGED from the original (data/methods/API kept byte-for-byte).
  • <template> rebuilt to the prototype: .pg-head + standard <id-data-grid>
    (global component) + add/edit + delete v-dialogs (unchanged, opened via @add / editItem / deleteItem).
  • Columns reuse the existing `headers` computed (REAL fields only).
  Requires global: src/assets/istar-design.css + istar-pages.css, and the
  globally-registered <id-data-grid> component (main.js).
============================================================ -->
<template>
  <div>
    <div class="pg-head">
      <div class="pg-ico"><span class="mdi mdi-view-dashboard-variant-outline"></span></div>
      <div>
        <div class="id-h1">{{ $t('classes.title') }}</div>
        <div class="pg-sub">ตารางคลาสประจำสัปดาห์</div>
      </div>
    </div>

    <id-data-grid
      :columns="headers"
      :rows="classlist"
      :search-keys="['coursename', 'classday']"
      :search-placeholder="$t('btn.search')"
      :add-label="$t('classes.newClass')"
      @add="dialog = true">
      <template #cell-actions="{ row }">
        <span class="mdi mdi-pencil" style="color:var(--c-info);cursor:pointer;font-size:20px;padding:0 5px" @click="editItem(row)"></span>
        <span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;font-size:20px;padding:0 5px" @click="deleteItem(row)"></span>
      </template>
    </id-data-grid>

    <!-- add / edit dialog -->
    <v-dialog v-model="dialog" max-width="500px">
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
                  :no-data-text="$t('common.noCourseData')" required></v-select>
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

    <!-- delete confirm dialog -->
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
        .catch(() => {
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
        .catch(() => {
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
        .catch(() => {
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