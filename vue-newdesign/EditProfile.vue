<!-- ============================================================
  EditProfile.vue — NEW DESIGN reskin (single iStar theme)
  Drop-in replacement for src/components/EditProfile.vue
  • <template> + <script> = UNCHANGED from the original (logic + all API
    calls kept byte-for-byte). A new-design <style scoped> override block
    is appended at the end to adopt the iStar look.
  • Requires global: src/assets/istar-design.css  (+ Vuetify theme primary=#ec4899)
============================================================ -->
<template>
  <div class="container">
    <div class="container-header">
      <h1><span class="mdi mdi-account-edit"></span> {{ $t('editProfile.title') }}</h1>
    </div>
    <div class="container-content">
      <v-card class="card-opacity edit-profile-card mx-auto mt-4">

        <!-- ── Profile photo ── -->
        <div class="profile-photo-section">
          <div class="profile-container">
            <div class="profile-wrap">
              <v-img :src="imagePreview || defaultAvatar" cover width="140" height="140"></v-img>
            </div>
            <label class="profile-upload-btn" for="edit-profile-upload">
              <v-icon size="18">mdi-camera</v-icon>
            </label>
            <input id="edit-profile-upload" type="file" accept="image/*"
                   style="display:none" @change="handleProfileUpload">
          </div>
          <p class="profile-username">{{ profile.firstname }} {{ profile.lastname }}</p>
        </div>

        <!-- ── Personal info ── -->
        <div class="section-header">
          <span class="mdi mdi-card-account-details-outline"></span> {{ $t('editProfile.personalInfo') }}
        </div>
        <v-form ref="profileForm" class="px-6 py-5">
          <v-text-field
            v-model="profile.email"
            :label="$t('editProfile.email')"
            variant="outlined"
            type="email"
            :rules="emailRules"
            prepend-inner-icon="mdi-email"
            class="mb-1"
          ></v-text-field>
          <v-text-field
            v-model="profile.mobileno"
            :label="$t('editProfile.phone')"
            variant="outlined"
            type="text"
            @input="acceptNumber"
            :rules="phoneRules"
            prepend-inner-icon="mdi-phone"
            class="mb-1"
          ></v-text-field>
          <v-textarea
            v-model="profile.address"
            :label="$t('editProfile.address')"
            variant="outlined"
            rows="3"
            prepend-inner-icon="mdi-map-marker"
            class="mb-2"
          ></v-textarea>
          <v-btn block size="large" class="neu-action-btn mt-2" @click="saveProfile">
            <v-icon>mdi-content-save</v-icon>
            &nbsp;{{ $t('editProfile.saveProfile') }}
          </v-btn>
        </v-form>

        <!-- ── Password change ── -->
        <div class="section-header">
          <span class="mdi mdi-lock-outline"></span> {{ $t('editProfile.changePasswordSection') }}
        </div>
        <v-form ref="passwordForm" class="px-6 py-5">
          <v-text-field
            v-model="password.current"
            :label="$t('editProfile.currentPassword')"
            variant="outlined"
            :type="showCurrent ? 'text' : 'password'"
            :rules="passwordRules"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showCurrent ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showCurrent = !showCurrent"
            class="mb-1"
          ></v-text-field>
          <v-text-field
            v-model="password.new"
            :label="$t('editProfile.newPassword')"
            variant="outlined"
            :type="showNew ? 'text' : 'password'"
            :rules="passwordRules"
            prepend-inner-icon="mdi-lock-plus"
            :append-inner-icon="showNew ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showNew = !showNew"
            class="mb-1"
          ></v-text-field>
          <v-text-field
            v-model="password.confirm"
            :label="$t('editProfile.confirmNewPassword')"
            variant="outlined"
            :type="showConfirm ? 'text' : 'password'"
            :rules="confirmPasswordRules"
            prepend-inner-icon="mdi-lock-check"
            :append-inner-icon="showConfirm ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showConfirm = !showConfirm"
            class="mb-2"
          ></v-text-field>
          <v-btn block size="large" class="neu-action-btn mt-2" @click="changePassword">
            <v-icon>mdi-key-variant</v-icon>
            &nbsp;{{ $t('editProfile.changePasswordBtn') }}
          </v-btn>
        </v-form>
      </v-card>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { mapGetters } from 'vuex';

export default {
  name: 'EditProfile',
  data() {
    return {
      profile: {
        username: '',
        firstname: '',
        middlename: '',
        lastname: '',
        email: '',
        mobileno: '',
        address: '',
      },
      password: {
        current: '',
        new: '',
        confirm: '',
      },
      showCurrent: false,
      showNew: false,
      showConfirm: false,
      imagePreview: null,
      emailRules: [
        v => !!v || this.$t('editProfile.emailRequired'),
        v => /.+@.+\..+/.test(v) || this.$t('editProfile.emailInvalid'),
      ],
      phoneRules: [
        v => !!v || this.$t('editProfile.phoneRequired'),
      ],
      passwordRules: [
        v => !!v || this.$t('editProfile.passwordRequired'),
        v => (v && v.length >= 6) || this.$t('editProfile.passwordMinLength'),
      ],
      confirmPasswordRules: [
        v => !!v || this.$t('editProfile.confirmRequired'),
        v => v === this.password.new || this.$t('editProfile.passwordMismatch'),
      ],
    };
  },
  computed: {
    ...mapGetters({ token: 'getToken' }),
    defaultAvatar() {
      return require('@/assets/avatar/4.png');
    },
  },
  async created() {
    const token = this.$store.getters.getToken;
    if (!token) {
      this.$emit('onClickChangeState', 'login');
      return;
    }
    try {
      await axios.post(this.baseURL + '/verifyToken', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      this.$emit('onClickChangeState', 'login');
      return;
    }
    await this.loadProfile();
  },
  methods: {
    acceptNumber() {
      const v = (this.profile.mobileno || '').replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      this.profile.mobileno = !v[2] ? v[1] : v[1] + '-' + v[2] + (v[3] ? '-' + v[3] : '');
    },
    async loadProfile() {
      try {
        this.$emit('onLoading', true);
        const userdata = JSON.parse(localStorage.getItem('userdata'));
        if (userdata) {
          this.profile.username = userdata.username || '';
          this.profile.firstname = userdata.firstname || '';
          this.profile.middlename = userdata.middlename || '';
          this.profile.lastname = userdata.lastname || '';
        }
        const res = await axios.post(
          this.baseURL + '/getUserProfile',
          { username: userdata?.username },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (res.data && res.data.success && res.data.user) {
          const u = res.data.user;
          this.profile.username = u.username || this.profile.username;
          this.profile.firstname = u.firstname || this.profile.firstname;
          this.profile.middlename = u.middlename || this.profile.middlename;
          this.profile.lastname = u.lastname || this.profile.lastname;
          this.profile.email = u.email || '';
          this.profile.mobileno = u.mobileno || '';
          this.profile.address = u.address || '';
          this.imagePreview = u.profile_image_url || null;
          if (u.profile_image_url) {
            this.$emit('onProfileImageUpdated', u.profile_image_url);
          }
        }
      } catch (e) {
        // backend ยังไม่รองรับ — เงียบไว้
      } finally {
        this.$emit('onLoading', false);
      }
    },
    async saveProfile() {
      const { valid } = await this.$refs.profileForm.validate();
      if (!valid) return;
      try {
        this.$emit('onLoading', true);
        const userdata = JSON.parse(localStorage.getItem('userdata'));
        const res = await axios.post(
          this.baseURL + '/updateUserProfile',
          {
            username: userdata.username,
            email: this.profile.email,
            mobileno: this.profile.mobileno,
            address: this.profile.address,
          },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (res.data && res.data.success) {
          this.$emit('onSuccessHandler', this.$t('editProfile.saveSuccess'));
        } else {
          this.$emit('onErrorHandler', (res.data && res.data.message) || this.$t('editProfile.saveFail'));
        }
      } catch (e) {
        this.$emit('onErrorHandler', this.$t('common.errorPrefix') + ': ' + (e.message || ''));
      } finally {
        this.$emit('onLoading', false);
      }
    },
    async changePassword() {
      const { valid } = await this.$refs.passwordForm.validate();
      if (!valid) return;
      try {
        this.$emit('onLoading', true);
        const userdata = JSON.parse(localStorage.getItem('userdata'));
        const hashedCurrent = CryptoJS.SHA256(this.password.current).toString();
        const hashedNew = CryptoJS.SHA256(this.password.new).toString();
        const res = await axios.post(
          this.baseURL + '/changePassword',
          {
            username: userdata.username,
            currentPassword: hashedCurrent,
            newPassword: hashedNew,
          },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (res.data && res.data.success) {
          this.$emit('onSuccessHandler', this.$t('editProfile.passwordChangeSuccess'));
          this.password.current = '';
          this.password.new = '';
          this.password.confirm = '';
          this.$refs.passwordForm.resetValidation();
        } else {
          this.$emit('onErrorHandler', (res.data && res.data.message) || this.$t('editProfile.passwordChangeFail'));
        }
      } catch (e) {
        this.$emit('onErrorHandler', this.$t('common.errorPrefix') + ': ' + (e.message || ''));
      } finally {
        this.$emit('onLoading', false);
      }
    },
    async handleProfileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) {
        this.$emit('onErrorHandler', this.$t('msg.fileTooLarge'));
        return;
      }
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      const ext = file.name.split('.').pop();
      const renamedFile = new File([file], `user-${userdata.username}.${ext}`, { type: file.type });
      const formData = new FormData();
      formData.append('profileImage', renamedFile);
      formData.append('username', String(userdata.username));
      try {
        this.$emit('onLoading', true);
        const response = await fetch(this.baseURL + '/uploadUserProfileImage', {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}` },
          body: formData,
        });
        const data = await response.json();
        if (data && data.url) {
          this.imagePreview = data.url;
          this.$emit('onProfileImageUpdated', data.url);
          this.$emit('onSuccessHandler', this.$t('msg.uploadSuccess'));
        } else {
          this.$emit('onErrorHandler', this.$t('msg.uploadFail'));
        }
      } catch (e) {
        this.$emit('onErrorHandler', this.$t('msg.uploadFail'));
      } finally {
        this.$emit('onLoading', false);
        event.target.value = '';
      }
    },
  },
};
</script>

<style scoped>
.edit-profile-card {
  max-width: 640px;
  width: 100%;
  padding-bottom: 20px;
  overflow: hidden;
}

.profile-photo-section {
  padding: 28px 0 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.profile-container {
  position: relative;
  display: inline-block;
}

.profile-wrap {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  background: #e0e5ec;
  box-shadow: 0 6px 16px rgba(163, 177, 198, 0.4);
}

.profile-upload-btn {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f43f5e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(244, 63, 94, 0.5);
  transition: transform 0.15s ease;
}

.profile-upload-btn:hover {
  transform: scale(1.05);
}

.profile-username {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(to right, #eef0f5, #f5f7fb);
  border-bottom: 1px solid rgba(163, 177, 198, 0.18);
  border-top: 1px solid rgba(163, 177, 198, 0.18);
}

.section-header .mdi {
  color: #6366f1;
  font-size: 15px;
}
</style>


<style scoped>
/* ============================================================
   iStar NEW DESIGN reskin (single theme) — layered overrides.
   Appended on top of the original styles so layout is preserved
   while colours / radius / shadow / fonts adopt the new design.
   Pulls tokens from the global src/assets/istar-design.css.
   ============================================================ */
:deep(.v-card){ border-radius: var(--radius-lg) !important; box-shadow: var(--shadow-sm) !important; border: 1px solid var(--c-border) !important; }
:deep(.v-btn){ border-radius: var(--radius-md) !important; text-transform: none !important; letter-spacing: normal !important; font-weight: 700 !important; }
:deep(.v-btn.bg-primary), :deep(.v-btn--variant-elevated){ box-shadow: var(--shadow-sm) !important; }
:deep(.v-field){ border-radius: 14px !important; }
:deep(.v-field--variant-solo-filled){ background: var(--c-surface-2) !important; box-shadow: none !important; }
:deep(.v-toolbar){ background: transparent !important; }
:deep(.v-toolbar-title){ font-family: var(--font-head) !important; font-weight: 800 !important; color: var(--c-text-heading) !important; }
:deep(.v-table){ background: transparent !important; }
:deep(.v-table > .v-table__wrapper > table > thead > tr > th){ background: var(--c-surface-2) !important; color: var(--c-text-heading) !important; font-family: var(--font-head) !important; font-weight: 700 !important; border-bottom: 2px solid var(--c-border) !important; }
:deep(.v-table > .v-table__wrapper > table > tbody > tr > td){ border-bottom: 1px solid var(--c-border) !important; }
:deep(.v-table > .v-table__wrapper > table > tbody > tr:hover > td){ background: var(--c-surface-3) !important; }
:deep(.v-chip){ font-weight: 600; }
:deep(.v-tab){ text-transform: none !important; font-weight: 700 !important; }
:deep(.v-list){ background: transparent !important; }
:deep(.group-header){ font-family: var(--font-head) !important; font-weight: 700 !important; color: var(--c-text-heading) !important; }
</style>
