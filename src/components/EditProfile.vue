<template>
  <div>
    <!-- ── Page head ── -->
    <div class="pg-head">
      <div class="pg-ico"><span class="mdi mdi-account-edit"></span></div>
      <div>
        <div class="id-h1">{{ $t('editProfile.title') }}</div>
        <div class="pg-sub">{{ $t('editProfile.personalInfo') }}</div>
      </div>
    </div>

    <div class="grid2 grid2-profile">
      <!-- LEFT: avatar card -->
      <div class="scard" style="padding:26px;text-align:center">
        <div class="avatar-up">
          <img v-if="imagePreview || defaultAvatar" :src="imagePreview || defaultAvatar"
               class="av-img" alt="profile" />
          <span v-else class="tt-avatar" style="background:var(--c-primary)">
            {{ (displayName.firstname || '?').charAt(0) }}
          </span>
          <label class="avatar-cam" title="เปลี่ยนรูป">
            <span class="mdi mdi-camera"></span>
            <input type="file" accept="image/*" style="display:none" @change="handleProfileUpload">
          </label>
        </div>
        <div class="strong" style="font-size:18px;color:var(--c-text-heading)">
          {{ displayName.firstname }} {{ displayName.lastname }}
        </div>
        <div class="t-cap" style="margin-bottom:14px">@{{ profile.username }}</div>
        <div class="col" style="gap:8px">
          <label class="id-btn id-btn-soft id-btn-sm" style="width:100%;cursor:pointer">
            <span class="mdi mdi-upload"></span> อัปโหลดรูปใหม่
            <input type="file" accept="image/*" style="display:none" @change="handleProfileUpload">
          </label>
          <button v-if="imagePreview" type="button" class="id-btn id-btn-ghost id-btn-sm"
                  style="width:100%;color:var(--c-error)" @click="removePhoto">
            <span class="mdi mdi-trash-can-outline"></span> ลบรูป
          </button>
        </div>
      </div>

      <!-- RIGHT: personal info card -->
      <div class="scard" style="padding:22px">
        <div class="isk-sec" style="margin-bottom:16px">
          <span class="mdi mdi-card-account-details-outline" style="color:var(--c-primary)"></span>
          {{ $t('editProfile.personalInfo') }}
        </div>
        <v-form ref="profileForm" class="id-form">
          <div class="form-grid">
            <div class="field">
              <label>{{ $t('register.firstname') }}</label>
              <input class="id-input" v-model="profile.firstname">
            </div>
            <div class="field">
              <label>{{ $t('register.lastname') }}</label>
              <input class="id-input" v-model="profile.lastname">
            </div>
            <div class="field full">
              <label>{{ $t('editProfile.email') }}</label>
              <v-text-field
                v-model="profile.email"
                variant="outlined"
                density="compact"
                hide-details="auto"
                type="email"
                :rules="emailRules"
                prepend-inner-icon="mdi-email"
              ></v-text-field>
            </div>
            <div class="field full">
              <label>{{ $t('editProfile.phone') }}</label>
              <v-text-field
                v-model="profile.mobileno"
                variant="outlined"
                density="compact"
                hide-details="auto"
                type="text"
                @input="acceptNumber"
                :rules="phoneRules"
                prepend-inner-icon="mdi-phone"
              ></v-text-field>
            </div>
            <div class="field full">
              <label>{{ $t('editProfile.address') }}</label>
              <v-textarea
                v-model="profile.address"
                variant="outlined"
                density="compact"
                hide-details="auto"
                rows="3"
                prepend-inner-icon="mdi-map-marker"
              ></v-textarea>
            </div>
          </div>
          <div class="row" style="gap:10px;margin-top:20px;flex-wrap:wrap">
            <button type="button" class="id-btn id-btn-primary" @click="saveProfile">
              <span class="mdi mdi-content-save"></span> {{ $t('editProfile.saveProfile') }}
            </button>
          </div>
        </v-form>
      </div>
    </div>

    <!-- BELOW: change password card -->
    <div class="scard" style="padding:22px;margin-top:16px">
      <div class="isk-sec" style="margin-bottom:16px">
        <span class="mdi mdi-lock-outline" style="color:var(--c-primary)"></span>
        {{ $t('editProfile.changePasswordSection') }}
      </div>
      <v-form ref="passwordForm" class="id-form">
        <div class="form-grid">
          <div class="field full">
            <label>{{ $t('editProfile.currentPassword') }}</label>
            <v-text-field
              v-model="password.current"
              variant="outlined"
              density="compact"
              hide-details="auto"
              :type="showCurrent ? 'text' : 'password'"
              :rules="passwordRules"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showCurrent ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showCurrent = !showCurrent"
            ></v-text-field>
          </div>
          <div class="field">
            <label>{{ $t('editProfile.newPassword') }}</label>
            <v-text-field
              v-model="password.new"
              variant="outlined"
              density="compact"
              hide-details="auto"
              :type="showNew ? 'text' : 'password'"
              :rules="passwordRules"
              prepend-inner-icon="mdi-lock-plus"
              :append-inner-icon="showNew ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showNew = !showNew"
            ></v-text-field>
          </div>
          <div class="field">
            <label>{{ $t('editProfile.confirmNewPassword') }}</label>
            <v-text-field
              v-model="password.confirm"
              variant="outlined"
              density="compact"
              hide-details="auto"
              :type="showConfirm ? 'text' : 'password'"
              :rules="confirmPasswordRules"
              prepend-inner-icon="mdi-lock-check"
              :append-inner-icon="showConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showConfirm = !showConfirm"
            ></v-text-field>
            <span v-if="password.confirm && password.new !== password.confirm"
                  style="font-size:12px;color:var(--c-error)">
              {{ $t('editProfile.passwordMismatch') }}
            </span>
          </div>
        </div>
        <div style="margin-top:18px">
          <button type="button" class="id-btn id-btn-primary" @click="changePassword">
            <span class="mdi mdi-lock-reset"></span> {{ $t('editProfile.changePasswordBtn') }}
          </button>
        </div>
      </v-form>
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
      // name shown under the avatar — only refreshed on load/save, NOT while typing
      displayName: {
        firstname: '',
        lastname: '',
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
          this.displayName.firstname = this.profile.firstname;
          this.displayName.lastname = this.profile.lastname;
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
          this.displayName.firstname = this.profile.firstname;
          this.displayName.lastname = this.profile.lastname;
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
            firstname: this.profile.firstname,
            middlename: this.profile.middlename,
            lastname: this.profile.lastname,
            email: this.profile.email,
            mobileno: this.profile.mobileno,
            address: this.profile.address,
          },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (res.data && res.data.success) {
          // commit the edited name to the avatar display only after a successful save
          this.displayName.firstname = this.profile.firstname;
          this.displayName.lastname = this.profile.lastname;
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
          // cache-bust so the new photo shows immediately in BOTH the form preview AND the
          // top-bar avatar (S3 reuses the key → identical URL → would show the cached old image)
          const busted = this.$bustCache(data.url);
          this.imagePreview = busted;
          this.$emit('onProfileImageUpdated', busted);
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
    async removePhoto() {
      try {
        this.$emit('onLoading', true);
        const userdata = JSON.parse(localStorage.getItem('userdata'));
        const res = await axios.post(
          this.baseURL + '/deleteUserProfileImage',
          { username: userdata.username },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        if (res.data && res.data.success) {
          this.imagePreview = null;
          this.$emit('onProfileImageUpdated', null);
          this.$emit('onSuccessHandler', this.$t('msg.deleted'));
        } else {
          this.$emit('onErrorHandler', (res.data && res.data.message) || this.$t('msg.uploadFail'));
        }
      } catch (e) {
        this.$emit('onErrorHandler', this.$t('common.errorPrefix') + ': ' + (e.message || ''));
      } finally {
        this.$emit('onLoading', false);
      }
    },
  },
};
</script>

<style scoped>
/* Let Vuetify form fields sit flush inside the new-design .field wrappers.
   Layout (grid/columns) comes from global istar-pages.css (.form-grid/.field). */
.id-form :deep(.v-field) {
  border-radius: var(--radius-md);
  background: var(--c-surface);
  font-family: var(--font-body);
}
.id-form :deep(.v-text-field),
.id-form :deep(.v-textarea) {
  width: 100%;
}
.id-form :deep(.v-input__details) {
  padding-top: 2px;
  min-height: 0;
}
</style>
