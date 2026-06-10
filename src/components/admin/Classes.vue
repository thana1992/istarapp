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
      :filters="classFilters"
      :search-placeholder="$t('btn.search')"
      :add-label="$t('classes.newClass')"
      :loading="loadingClasses"
      @add="dialog = true">
      <template #cell-actions="{ row }">
        <span class="mdi mdi-pencil" style="color:var(--c-info);cursor:pointer;font-size:20px;padding:0 5px" @click="editItem(row)"></span>
        <span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;font-size:20px;padding:0 5px" @click="deleteItem(row)"></span>
      </template>
    </id-data-grid>

    <!-- add / edit dialog -->
    <id-modal v-model="dialog" size="md" icon="mdi-calendar-clock" :title="formTitle">
      <div class="modal-sec"><span class="mdi mdi-calendar-edit"></span> ข้อมูลคลาสเรียน</div>
      <div class="form-grid">
        <div class="field full"><label>{{ $t('table.courseName') }} <span class="req">*</span></label>
          <id-select v-model="editedItem.courseid" searchable placeholder="— เลือกคอร์ส —"
            :options="courseLookup.map(c => ({ value: c.courseid, label: c.coursename }))"></id-select>
        </div>
        <div class="field"><label>{{ $t('table.classDay') }}</label><input class="id-input" v-model="editedItem.classday"></div>
        <div class="field"><label>{{ $t('table.classTime') }}</label><input class="id-input" v-model="editedItem.classtime"></div>
        <div class="field"><label>{{ $t('table.maxStudent') }}</label><input class="id-input" v-model="editedItem.maxperson"></div>
        <div class="field"><label>{{ $t('table.adminFlag') }}</label><input class="id-input" v-model="editedItem.adminflag"></div>
      </div>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="close">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" :disabled="!editedItem.courseid" @click="save">
          <span class="mdi mdi-content-save"></span> {{ $t('btn.save') }}</button>
      </template>
    </id-modal>

    <!-- delete confirm dialog -->
    <id-modal v-model="dialogDelete" size="sm" icon="mdi-delete-alert-outline" title="ยืนยันการลบ" persistent>
      <p style="margin:0">{{ $t('classes.confirmDelete') }}</p>
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
    // toolbar filters (client-side, handled by IdDataGrid): by class day + by course
    classFilters() {
      const uniq = (k) => [...new Set(this.classlist.map(r => r[k]).filter(v => v !== null && v !== ''))]
        .map(v => ({ value: v, label: String(v) }))
      return [
        { key: 'classday', label: this.$t('table.classDay'), options: uniq('classday') },
        { key: 'coursename', label: this.$t('table.courseName'), options: uniq('coursename') },
      ]
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
      // menu-entry load: grid skeleton (loadingClasses) shows for the real fetch
      // only — NO artificial $minLoad here (that 1s delay is for grid page changes,
      // not for navigating into the menu).
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
        })
        .catch(() => {
          //console.error(error);
        });
      await this.getCourseLookup()
      this.loadingClasses = false
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