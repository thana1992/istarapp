<template>
    <div class="container">
        <div class="container-header">
            <h1><span class="mdi mdi-gymnastics"></span> Gymnast Management</h1>
        </div>
        <div class="container-content">
            <v-divider color="#fffff" thickness="3"></v-divider>
            <Student @onErrorHandler="onErrorHandler" @onInfoHandler="onShowInfoDialog" @onLoading="onLoading($event)">
            </Student>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import DatePicker from '@/components/DatePicker.vue'
import Student from '../center/Student.vue';
import { mapGetters } from 'vuex';

export default {
    components: {
        DatePicker,
        Student,
    },
    data() {
        return {
        }
    },
    async created() {
        try {
            const token = this.$store.getters.getToken;
            console.log('token ', token)
            if (!token) {
                this.errorMsg = 'Not found token, Please login...'
                this.errorDialog = true
                this.$emit('onClickChangeState', 'login')
                return;
            }

            await axios
                .post(this.baseURL + '/verifyToken', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                .then(response => {
                    console.dir(response);
                    if (response.data.success) {
                        //this.initialize()
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.$emit('onErrorHandler', error.response.data.message)
                    this.$emit('onClickChangeState', 'login')
                });
        } catch (error) {
            this.$emit('onErrorHandler', error.message)
        }

    },
    methods: {
        onShowInfoDialog(msg) {
            this.$emit('onInfoHandler', msg)
        },
        onErrorHandler(msg) {
            this.$emit('onErrorHandler', msg)
        },
        onLoading(isLoading) {
            this.$emit('onLoading', isLoading)
        },
    },
    computed: {
        ...mapGetters({
            token: 'getToken',
        }),
    }
}

</script>
<style scoped>
.info-photo {
    width: 150px;
    height: 150px;
    border-radius: 100%;
    display: flex;
    justify-content: center;
}

.center {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
```