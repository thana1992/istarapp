<!-- ============================================================
  Courses.vue — NEW DESIGN 1:1 (iStar).
  • <script> = UNCHANGED from the original (data/methods/API kept byte-for-byte).
  • <template> rebuilt to the prototype: .pg-head + standard <id-data-grid>
    (global component) + add/edit + delete v-dialogs (unchanged, opened via @add / editItem / deleteItem).
  • Columns use the REAL fields only (coursename / course_shortname / actions) —
    the preview's demo code/enable columns are intentionally omitted.
  Requires global: src/assets/istar-design.css + istar-pages.css, and the
  globally-registered <id-data-grid> component (main.js).
============================================================ -->
<template>
  <div>
    <div class="pg-head">
      <div class="pg-ico"><span class="mdi mdi-star-shooting-outline"></span></div>
      <div>
        <div class="id-h1">{{ $t('courses.title') }}</div>
        <div class="pg-sub">{{ $t('courses.ourCourses') }}</div>
      </div>
    </div>

    <id-data-grid
      :columns="[
        { key: 'coursename', label: $t('table.courseName') },
        { key: 'course_shortname', label: $t('table.courseShortName') },
        { key: 'actions', label: $t('table.actions'), align: 'center' },
      ]"
      :rows="courselist"
      :search-keys="['coursename', 'course_shortname']"
      :search-placeholder="$t('btn.search')"
      :add-label="$t('courses.newCourse')"
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
              <v-col cols="12">
                <v-text-field v-model="editedItem.coursename" :label="$t('table.courseName')"
                  variant="solo-filled"></v-text-field>
              </v-col>
              <v-col cols="12">
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

    <!-- delete confirm dialog -->
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
        .catch(() => {
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
