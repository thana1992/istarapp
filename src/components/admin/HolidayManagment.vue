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
      @add="showAddNewHoliday">
      <template #cell-holidaydate="{ row }">{{ format_date(row.holidaydate) }}</template>
      <template #cell-actions="{ row }">
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
              <v-col cols="12" class="text-center">
                <v-date-picker v-model="editedItem.holidaydate" :label="$t('table.holidayDate')" required></v-date-picker>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="editedItem.description" :label="$t('table.description')" variant="solo-filled" required></v-text-field>
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
    <v-dialog v-model="dialogHolidayDelete" persistent width="auto">
      <v-card>
        <v-card-title></v-card-title>
        <v-card-text>{{ $t('holidays.confirmDelete', { date: editedItem.holidaydate }) }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#4CAF50" variant="tonal" @click="clickConfirmDeleteHoliday">{{ $t('btn.ok') }}</v-btn>
          <v-btn color="#F44336" variant="tonal" @click="clickCancelDeleteHoliday">{{ $t('btn.cancel') }}</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
        this.loadingHolidays = true;
        const token = this.$store.getters.getToken;
        await axios.get(this.baseURL+'/collectHolidays',{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
          .then(response => {
            this.holidayList = response.data.data;
            this.loadingHolidays = false;
          })
          .catch(() => {
            //console.error(error);
            this.loadingHolidays = false;
          });
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