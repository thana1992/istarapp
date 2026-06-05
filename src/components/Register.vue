<template>
  <div class="container">
    <div class="container-header">
      <h1><span class="mdi mdi-account-plus"></span> {{ $t('register.title') }}</h1>
    </div>
    <div class="container-content">
      <v-divider color="#fffff" thickness="3"></v-divider>
      <v-card class="reg-card card-opacity mx-auto mt-4 px-6 py-6">
        <v-form ref="form">
          <v-text-field variant="solo-filled" v-model="username" :label="$t('register.username')" :rules="usernameRules" @input="removeSpaces('username')" required></v-text-field>

          <v-text-field variant="solo-filled" v-model="password" :label="$t('register.password')" type="password" :rules="passwordRules" required></v-text-field>

          <v-text-field variant="solo-filled" v-model="firstname" :label="$t('register.firstname')" :rules="nameRules" required></v-text-field>

          <v-text-field variant="solo-filled" v-model="middlename" :label="$t('register.middlename')"></v-text-field>

          <v-text-field variant="solo-filled" v-model="lastname" :label="$t('register.lastname')" :rules="nameRules" required></v-text-field>

          <v-text-field variant="solo-filled" v-model="address" :label="$t('register.address')" type="text" required></v-text-field>

          <v-text-field variant="solo-filled" v-model="email" :label="$t('register.email')" type="text" :rules="emailRules" @input="removeSpaces('email')" required></v-text-field>

          <v-text-field variant="solo-filled" v-model="mobileno" :label="$t('register.mobile')" @input="acceptNumber" type="text" :rules="mobileRules" required></v-text-field>

          <v-text-field variant="solo-filled" v-model="registercode" :label="$t('register.code')" type="text" @input="removeSpaces('registercode')" required></v-text-field>

          <v-checkbox v-model="acceptPrivacyPolicy">
            <template v-slot:label>
              <div style="font-size: 12px;">
                {{ $t('register.privacyConsent') }}
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <a
                      href="https://pdpa.pro/policies/view/en/UPCCiojcXUZQNYALpC1phePL"
                      target="_blank"
                      v-bind="props"
                      @click.stop
                    >
                      {{ $t('register.privacyOf') }} {{ $t('register.privacyPolicy') }}
                    </a>
                  </template>
                  {{ $t('register.privacyPolicy') }}
                </v-tooltip>
              </div>
            </template>
          </v-checkbox>

          <v-btn color="blue" class="mt-1" :disabled="!acceptPrivacyPolicy" block @click="doRegister">
            {{ $t('register.submit') }}
          </v-btn>
          <v-btn color="error" class="mt-4" block @click="reset">
            {{ $t('register.clear') }}
          </v-btn>
          <v-btn color="grey" class="mt-4" block @click="cancel">
            {{ $t('register.cancel') }}
          </v-btn>
        </v-form>
      </v-card>
    </div>
  </div>
</template>

<script>
import { VBottomNavigation, VBottomSheet } from 'vuetify/lib/components/index.mjs'
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { t } from "@/i18n";

export default {
  data: () => ({
    username: '',
    password: '',
    registercode: '',
    firstname: '',
    middlename: '',
    lastname: '',
    address: '',
    email: '',
    mobileno: '',
    acceptPrivacyPolicy: false,
    usernameRules: [
      v => !!v || t('validation.usernameRequired'),
      v => !/\s/.test(v) || t('validation.usernameNoSpaces'),
      v => /^[\x00-\x7F]+$/.test(v) || t('validation.usernameEnglishOnly'),
    ],
    passwordRules: [
      v => !!v || t('validation.passwordRequired'),
    ],
    nameRules: [
      v => !!v || t('validation.nameRequired'),
    ],
    mobileRules: [
      v => !!v || t('validation.mobileRequired'),
    ],
    emailRules: [
      v => !!v || t('validation.emailRequired'),
      v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || t('validation.emailInvalid')
    ]
  }),
  methods: {
    async doRegister() {
      this.$emit('onLoading', true)
      const { valid } = await this.$refs.form.validate()

      if (valid) {
        // Check if username and password are not empty
        if (!this.username || !this.password) {
          alert(t('msg.bothCredsRequired'));
          return;
        }

        const encryptedPassword = this.encryptPassword(this.password);
        // Make API request to register the user
        axios
          .post(this.baseURL + '/register', {
            username: this.username,
            password: encryptedPassword,
            firstname: this.firstname,
            middlename: this.middlename,
            lastname: this.lastname,
            address: this.address,
            email: this.email,
            mobileno: this.mobileno,
            registercode: this.registercode.trim(),
            acceptPrivacyPolicy: this.acceptPrivacyPolicy
          })
          .then(response => {
            if (response.data.success) {
              this.$emit('onSuccessHandler', response.data.message || t('msg.registerSuccess'));
            } else {
              this.$emit('onErrorHandler', response.data.message || t('msg.registerFail'));
            }
          })
          .catch(error => {
            //console.error(error);
            alert(error.message)
          });
      }
      this.$emit('onLoading', false)
    },
    acceptNumber() {
      var x = this.mobileno.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      this.mobileno = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '');
    },
    reset() {
      this.$refs.form.reset()
    },
    resetValidation() {
      this.$refs.form.resetValidation()
    },
    cancel() {
      this.$emit('onCancelHandler', 'login');
    },
    encryptPassword(password) {
      const encryptedPassword = CryptoJS.SHA256(password).toString();
      return encryptedPassword;
    },
    removeSpaces(field) {
      this[field] = this[field].replace(/\s+/g, '');
    }
  },
}
</script>
<style scoped></style>