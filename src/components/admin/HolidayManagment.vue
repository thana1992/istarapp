<template>
  <div>
    <div class="pg-head">
      <div class="pg-ico"><span class="mdi mdi-calendar-remove"></span></div>
      <div>
        <div class="id-h1">{{ $t('holidays.title') }}</div>
        <div class="pg-sub">วันที่ปิดทำการ</div>
      </div>
    </div>

    <id-data-grid
      :columns="headers"
      :rows="holidayList"
      :search-keys="['description']"
      :search-placeholder="$t('btn.search')"
      :add-label="$t('holidays.newHoliday')"
      :loading="loadingHolidays"
      @add="showAddNewHoliday">
      <template #cell-holidaydate="{ row }">{{ format_date(row.holidaydate) }}</template>
      <template #cell-actions="{ row }">
        <span class="mdi mdi-delete-forever" style="color:var(--c-error);cursor:pointer;font-size:20px;padding:0 5px" @click="deleteItem(row)"></span>
      </template>
    </id-data-grid>

    <!-- add dialog -->
    <id-modal v-model="dialog" size="sm" icon="mdi-calendar-star" :title="formTitle">
      <div class="modal-sec"><span class="mdi mdi-calendar-remove"></span> ข้อมูลวันหยุด</div>
      <div class="form-grid">
        <div class="field full"><label>{{ $t('table.holidayDate') }} <span class="req">*</span></label>
          <id-date v-model="editedItem.holidaydate" placeholder="เลือกวันที่"></id-date></div>
        <div class="field full"><label>{{ $t('table.description') }} <span class="req">*</span></label>
          <input class="id-input" v-model="editedItem.description"></div>
      </div>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="close">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" :disabled="!editedItem.holidaydate || !editedItem.description" @click="save">
          <span class="mdi mdi-content-save"></span> {{ $t('btn.save') }}</button>
      </template>
    </id-modal>

    <!-- delete confirm dialog -->
    <id-modal v-model="dialogHolidayDelete" size="sm" icon="mdi-delete-alert-outline" title="ยืนยันการลบ" persistent>
      <p style="margin:0">{{ $t('holidays.confirmDelete', { date: format_date(editedItem.holidaydate) }) }}</p>
      <template #footer>
        <button class="id-btn id-btn-ghost" @click="clickCancelDeleteHoliday">{{ $t('btn.cancel') }}</button>
        <button class="id-btn id-btn-primary" style="background:var(--c-error)" @click="clickConfirmDeleteHoliday">
          <span class="mdi mdi-delete"></span> {{ $t('btn.ok') }}</button>
      </template>
    </id-modal>
  </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { mapGetters } from 'vuex';
  import moment from 'moment'

  export default {
    data: () => ({
      dialog: false,
      dialogHolidayDelete: false,
      loadingHolidays: false,
      holidayList: [],
      editedItem: {
        holidaydate: null,
        description: null,
      },
      defaultItem: {
        holidaydate: null,
        description: null,
      },
    }),
    computed: {
        formTitle() {
          return this.editedIndex === -1 ? this.$t('holidays.newHoliday') : this.$t('holidays.editHoliday')
        },
        headers() {
          return [
            { title: this.$t('table.holidayDate'), key: 'holidaydate', sortable: true },
            { title: this.$t('table.description'), key: 'description', sortable: false, align: 'start' },
            { title: this.$t('table.delete'), key: 'actions', sortable: false, align: 'center' },
          ]
        },
        ...mapGetters({
            token: 'getToken',
        }),
    },
    async created() {
      await this.initialize();
    },
    methods: {
      async initialize() {
        // menu-entry load: skeleton for the real fetch only (no artificial $minLoad)
        this.loadingHolidays = true;
        const token = this.$store.getters.getToken;
        await axios.get(this.baseURL+'/collectHolidays',{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
          .then(response => {
            this.holidayList = response.data.data;
          })
          .catch(() => {
            //console.error(error);
          });
        this.loadingHolidays = false;
      },
      async deleteItem(item) {
        this.editedIndex = this.holidayList.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.dialogHolidayDelete = true;
        
      },
      async clickConfirmDeleteHoliday() {
        const token = this.$store.getters.getToken;
        await axios.delete(this.baseURL+`/holidays/${this.editedItem.id}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
          .then(() => {
            this.initialize();
          })
          .catch(() => {
            //console.error(error);
          });
          this.dialogHolidayDelete = false;
      },
      clickCancelDeleteHoliday() {
          this.dialogHolidayDelete = false;
          this.$nextTick(() => {
              this.editedItem = Object.assign({}, this.defaultItem);
              this.editedIndex = -1;
          });
      },
      async save() {
        const token = this.$store.getters.getToken;
        if (this.editedItem.id) {
            await axios.put(this.baseURL+`/holidays/${this.editedItem.id}`, {
                    holidaydate: this.SQLDate(this.editedItem.holidaydate),
                    description: this.editedItem.description,
                },{
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
        } else {
            await axios.post(this.baseURL+'/holidays', {
                    holidaydate: this.SQLDate(this.editedItem.holidaydate),
                    description: this.editedItem.description,
                },{
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
        }
        this.close();
        this.initialize();
      },
      showAddNewHoliday() {
        this.$nextTick(() => {
              this.editedItem = Object.assign({}, this.defaultItem);
              this.editedIndex = -1;
          });
        this.dialog = true;
      },
      close() {
        this.dialog = false;
        this.editedItem = { ...this.defaultItem };
      },
        SQLDate(date) {
            return moment(date).format('YYYY-MM-DD')
        },
        format_date(value) {
            if (value) {
                return moment(value).format('DD/MM/YYYY')
            }
        },
    },
  };
  </script>
  <style scoped>
  .text-center {
    justify-items: center;
  }
  </style>