<template>
  <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-account-plus"></span> Reservation</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" length="100vw" thickness="3"></v-divider>
            
            <div class="d-flex justify-center mb-3">
            <v-form ref="reserveForm">
                <v-row justify="space-around" class="ma-2 pa-2">
                    <p>{{ person.name }}</p>
                </v-row>
                <v-row justify="space-around" class="ma-2 pa-2">
                    <v-date-picker
                        v-model="date"
                        :min="tomorrow"
                        @click="selectDate"
                    ></v-date-picker>
                </v-row>
                <v-row justify="space-around" class="ma-2 pa-2">
                    <v-select
                    v-model="class_time"
                    label="Class time"
                    class="ma-2 pa-2"
                    :items="['09:00 - 10:30', '10:30 - 12:00', '14:00 - 15:30', '16:00 - 17:30']"
                    variant="outlined"
                    :rules="classTimeRules"
                    required
                    ></v-select>
                </v-row>
                
                <v-row justify="space-around" class="ma-2 pa-2">
                    <v-btn
                        color="success"
                        class="mt-4"
                        block
                        @click="validate"
                        required
                    >
                        Reserve
                    </v-btn>
                </v-row>
            </v-form>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    props: {
        person: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            date: new Date(),
            tomorrow: new Date(),
            class_time: null,
            people: '',
            classTimeRules: [
                v => !!v || 'Class time is required',
            ],
        }
    },
    mounted() {
        const tomorrow = new Date()
        tomorrow.setDate(new Date().getDate()+1)
        this.date = tomorrow
    },
    methods: {
        selectDate() {
            console.log(this.date)
            this.class_time = null
        },
        async validate() {
            console.log(this.date.toLocaleDateString() + ' ' + this.class_time)
            const { valid } = await this.$refs.reserveForm.validate()
            console.log(valid)
            if(!valid) return;
            this.$emit('onClickChangeState', this.person)
            
        }
    }

  }
</script>

<style>

</style>