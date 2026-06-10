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
      :loading="loadingCourses"
      @add="dialog = true">
      <template #cell-actions="{ row }">
        <span class="mdi mdi-pencil" style="color:var(--c-info);cursor:pointer;font-size:20px;padding:0 5px" @click="editItem(row)"></span>
        <span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;font-size:20px;padding:0 5px" @click="deleteItem(row)"></span>
      </template>
    </id-data-grid>

    <!-- add / edit dialog -->
    <id-modal v-model="dialog" size="md" icon="mdi-book-plus-multiple-outline" :title="formTitle">
      <div class="modal-sec"><span class="mdi mdi-book-open-variant"></span> ข้อมูลคอร์ส</div>
      <div class="form-grid">
        <div class="field full"><label>{{ $t('table.courseName') }} <span class="req">*</span></label>
          <input class="id-input" v-model="editedItem.coursename"></div>
        <div class="field full"><label>{{ $t('table.courseShortName') }}</label>
          <input class="id-input" v-model="editedItem.course_shortname"></div>
      </div>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="close">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" :disabled="!editedItem.coursename" @click="save">
          <span class="mdi mdi-content-save"></span> {{ $t('btn.save') }}</button>
      </template>
    </id-modal>

    <!-- delete confirm dialog -->
    <id-modal v-model="dialogDelete" size="sm" icon="mdi-delete-alert-outline" title="ยืนยันการลบ" persistent>
      <p style="margin:0">{{ $t('courses.confirmDelete') }}</p>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="closeDelete">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" style="background:var(--c-error)" @click="deleteItemConfirm">
          <span class="mdi mdi-delete"></span> {{ $t('btn.ok') }}</button>
      </template>
    </id-modal>
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
      // menu-entry load: skeleton for the real fetch only (no artificial $minLoad —
      // the 1s delay is reserved for grid page changes, not menu navigation)
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
        })
        .catch(() => {
          //console.error(error);
        });
      this.loadingCourses = false;
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
