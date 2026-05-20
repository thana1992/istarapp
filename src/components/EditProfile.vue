<template>
  <div class="container">
    <div class="container-header">
      <h1><span class="mdi mdi-account-edit"></span> แก้ไขข้อมูล</h1>
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
          <span class="mdi mdi-card-account-details-outline"></span> ข้อมูลส่วนตัว
        </div>
        <v-form ref="profileForm" class="px-6 py-5">
          <v-text-field
            v-model="profile.email"
            label="อีเมล"
            variant="outlined"
            type="email"
            :rules="emailRules"
            prepend-inner-icon="mdi-email"
            class="mb-1"
          ></v-text-field>
          <v-text-field
            v-model="profile.mobileno"
            label="เบอร์โทรศัพท์"
            variant="outlined"
            type="text"
            @input="acceptNumber"
            :rules="phoneRules"
            prepend-inner-icon="mdi-phone"
            class="mb-1"
          ></v-text-field>
          <v-textarea
            v-model="profile.address"
            label="ที่อยู่"
            variant="outlined"
            rows="3"
            prepend-inner-icon="mdi-map-marker"
            class="mb-2"
          ></v-textarea>
          <v-btn block size="large" class="neu-action-btn mt-2" @click="saveProfile">
            <v-icon>mdi-content-save</v-icon>
            &nbsp;บันทึกข้อมูล
          </v-btn>
        </v-form>

        <!-- ── Password change ── -->
        <div class="section-header">
          <span class="mdi mdi-lock-outline"></span> เปลี่ยนรหัสผ่าน
        </div>
        <v-form ref="passwordForm" class="px-6 py-5">
          <v-text-field
            v-model="password.current"
            label="รหัสผ่านปัจจุบัน"
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
            label="รหัสผ่านใหม่"
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
            label="ยืนยันรหัสผ่านใหม่"
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
            &nbsp;เปลี่ยนรหัสผ่าน
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
        v => !!v || 'กรุณากรอกอีเมล',
        v => /.+@.+\..+/.test(v) || 'รูปแบบอีเมลไม่ถูกต้อง',
      ],
      phoneRules: [
        v => !!v || 'กรุณากรอกเบอร์โทรศัพท์',
      ],
      passwordRules: [
        v => !!v || 'กรุณากรอกรหัสผ่าน',
        v => (v && v.length >= 6) || 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      ],
      confirmPasswordRules: [
        v => !!v || 'กรุณายืนยันรหัสผ่าน',
        v => v === this.password.new || 'รหัสผ่านไม่ตรงกัน',
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
          this.$emit('onSuccessHandler', 'บันทึกข้อมูลสำเร็จ');
        } else {
          this.$emit('onErrorHandler', (res.data && res.data.message) || 'บันทึกข้อมูลไม่สำเร็จ');
        }
      } catch (e) {
        this.$emit('onErrorHandler', 'เกิดข้อผิดพลาด: ' + (e.message || 'ลองอีกครั้ง'));
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
          this.$emit('onSuccessHandler', 'เปลี่ยนรหัสผ่านสำเร็จ');
          this.password.current = '';
          this.password.new = '';
          this.password.confirm = '';
          this.$refs.passwordForm.resetValidation();
        } else {
          this.$emit('onErrorHandler', (res.data && res.data.message) || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
        }
      } catch (e) {
        this.$emit('onErrorHandler', 'เกิดข้อผิดพลาด: ' + (e.message || 'ลองอีกครั้ง'));
      } finally {
        this.$emit('onLoading', false);
      }
    },
    async handleProfileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) {
        this.$emit('onErrorHandler', 'ไฟล์รูปต้องไม่เกิน 4MB');
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
          this.$emit('onSuccessHandler', 'อัพโหลดรูปสำเร็จ');
        } else {
          this.$emit('onErrorHandler', 'อัพโหลดรูปไม่สำเร็จ');
        }
      } catch (e) {
        this.$emit('onErrorHandler', 'อัพโหลดรูปไม่สำเร็จ');
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
