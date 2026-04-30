<template>
    <div class="container">
      <div class="container-header">
        <h1><span class="mdi mdi-calendar-remove"></span> {{ $t('holidays.title') }}</h1>
        <h3 class="program-description">{{ $t('holidays.description') }}</h3>
      </div>
      <div class="container-content">
        <v-card class="mx-auto mt-5 card-opacity">
          <v-data-table :headers="headers" :items="holidayList" :loading="loadingHolidays">
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>{{ $t('holidays.ourHolidays') }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-dialog v-model="dialog" max-width="500px">
                  <template v-slot:activator="{ props }">
                    <v-btn color="primary" dark v-bind="props">
                      {{ $t('holidays.newHoliday') }}
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span>{{ formTitle }}</span>
                    </v-card-title>
    
                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col cols="12" class="text-center">
                            <v-date-picker v-model="editedItem.holidaydate" label="Holiday Date" required></v-date-picker>
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
              </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon size="large" color="error" @click="deleteItem(item)">mdi-delete-forever</v-icon>
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
            this.holidayList.forEach(holiday => {
              holiday.holidaydate = this.format_date(holiday.holidaydate);
            });
            this.loadingHolidays = false;
          })
          .catch(error => {
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
          .catch(error => {
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
                return moment(String(value)).format('DD/MM/YYYY')
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