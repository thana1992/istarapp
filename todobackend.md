# 🛠 TODO Backend — สิ่งที่ frontend (ดีไซน์ใหม่ iStar) ต้องให้หลังบ้านรองรับ

> งานรีดีไซน์ส่วนใหญ่ **แตะเฉพาะ `<template>`/style ใช้ API เดิม** ไม่ต้องแก้หลังบ้าน
> ด้านล่างคือเฉพาะ "ของใหม่" ที่ frontend เพิ่มเข้ามา และยังรอหลังบ้านรองรับ

---

## ⚠️ กฎสำคัญ — Backward compatibility (ต้องไม่ทำหลังบ้านพัง)
ฟิลด์ใหม่ทุกตัว/endpoint ใหม่ทุกอันด้านล่าง **ต้องเป็น OPTIONAL** — เพราะหลังบ้านจะถูก deploy ก่อน/หลัง frontend ไม่พร้อมกัน และอาจมี frontend **เวอร์ชันเก่าที่ยังไม่ส่งฟิลด์ใหม่** เรียกเข้ามา ต้องรองรับทั้งสองกรณีโดย:

1. **ห้าม error / 500** เมื่อ request ไม่มีฟิลด์ใหม่ (เช่น ไม่มี `firstname`) — ให้ถือว่า "ไม่ได้ส่งมา"
2. **ห้ามทับค่าเดิมด้วย NULL/ค่าว่าง** เมื่อฟิลด์ไม่ได้ถูกส่งมา
   - ❌ อย่าทำ `SET firstname = :firstname` ตรง ๆ (ถ้า `:firstname` เป็น undefined ชื่อจะถูกล้างหาย)
   - ✅ ให้ **อัปเดตเฉพาะฟิลด์ที่ถูกส่งมาจริง** (build SQL แบบ dynamic) หรือใช้ `COALESCE(:firstname, firstname)` เพื่อคงค่าเดิมไว้ถ้าไม่ได้ส่ง
3. **endpoint ใหม่ที่ไม่ถูกเรียก = ไม่กระทบ** (เป็น additive อยู่แล้ว) — แค่ต้องมีไว้รอ

> สรุป: เก่าเรียกได้ ใหม่เรียกได้ ไม่ตาย ไม่ลบข้อมูลทิ้ง

---

## 1. `/updateUserProfile` — รับฟิลด์ชื่อ-นามสกุลเพิ่ม  ⛔ ยังไม่รับ
หน้า **แก้ไขข้อมูล (EditProfile)** เปิดให้แก้ ชื่อ/นามสกุล ได้แล้ว และส่งฟิลด์เพิ่มใน payload

**Request body ปัจจุบันที่ frontend ส่ง:**
```json
{
  "username": "...",
  "firstname": "...",     // ⬅️ เพิ่มใหม่
  "middlename": "...",    // ⬅️ เพิ่มใหม่
  "lastname": "...",      // ⬅️ เพิ่มใหม่
  "email": "...",
  "mobileno": "...",
  "address": "..."
}
```
**ต้องทำ:** เพิ่ม `firstname`, `middlename`, `lastname` ลงใน `UPDATE` ของตาราง user
**⚠️ ต้อง OPTIONAL (ดู "กฎสำคัญ" ด้านบน):** ถ้า request ไม่มี 3 ฟิลด์นี้ (frontend เก่า) **ห้าม `SET firstname = NULL`** — ให้คงค่าเดิมไว้ (อัปเดตเฉพาะฟิลด์ที่ส่งมา หรือ `COALESCE`) ไม่งั้นชื่อผู้ใช้หาย
**Response ที่ frontend คาดหวัง:** `{ "success": true }` (หรือ `{ "success": false, "message": "..." }`)
ไฟล์: `src/components/EditProfile.vue` → `saveProfile()`

---

## 2. `/deleteUserProfileImage` — endpoint ใหม่ (ลบรูปโปรไฟล์)  ⛔ ยังไม่มี
หน้า EditProfile มีปุ่ม **"ลบรูป"** เรียก endpoint นี้

**Method/URL:** `POST /deleteUserProfileImage`
**Request body:**
```json
{ "username": "..." }
```
**ต้องทำ:** ลบไฟล์รูปโปรไฟล์ของ user + เคลียร์ `profile_image_url` ใน DB ให้เป็น null
**Response ที่ frontend คาดหวัง:** `{ "success": true }` (หรือ `{ "success": false, "message": "..." }`)
> 📌 ชื่อ route นี้ผม "ตั้งเอง" ให้ล้อกับ `/uploadUserProfileImage` — ถ้าหลังบ้านอยากใช้ชื่ออื่น บอกผมแก้ที่ frontend ได้
ไฟล์: `src/components/EditProfile.vue` → `removePhoto()`

---

## 3. `/getFamilyMember` — เพิ่มฟิลด์ `total` (โควตารวม) สำหรับ progress bar  ⛔ ยังไม่มี
หน้า **หน้าแรก (Home)** อยากแสดง **progress bar คงเหลือ/ทั้งหมด** ในการ์ดนักเรียนแต่ละคน
ตอนนี้ response มีแค่ `remaining` ไม่มีตัวหาร (โควตารวมที่ซื้อมา) เลยทำ bar ไม่ได้ (ไม่อยากใส่เลขมั่ว)

**ต้องทำ:** เพิ่มฟิลด์ `total` (เช่น `total_sessions` / จำนวนครั้งที่ซื้อทั้งหมดของคอร์สแบบ Limited) ต่อสมาชิก 1 คน ใน `results[]`
**พอมีแล้ว** frontend จะเติม progress bar = `remaining / total` ให้ทันที
ไฟล์: `src/components/Home.vue`

---

## (ทางเลือก) จุดที่ frontend ปรับให้ทำงานได้โดยไม่ต้องแก้หลังบ้าน — แต่ถ้าหลังบ้านเสริมข้อมูลจะสวยขึ้น

- **FamilyList** (`/getFamilyMember`): ป้าย badge ตอนนี้เป็น **ไอคอนล้วน** (รอตรวจ/ปกติ) เพราะ response ไม่มีจำนวนครั้งคงเหลือต่อสมาชิก — ถ้าเพิ่ม `remaining` ต่อสมาชิกมาด้วย จะโชว์ badge "X ครั้ง" ได้
- **Home** ส่วน "การจองที่จะถึง": ใช้ `memberReservationDetail` (จาก `/getMemberReservationDetail`) แทน "ประวัติการเรียน" เพราะไม่มี API ประวัติย้อนหลังแยก — ถ้าต้องการโชว์ประวัติ (เข้าเรียน/ขาดเรียน) ต้องมี API/ฟิลด์ประวัติ
- **EditProfile**: sidebar (เมนูซ้าย) จะอัปเดตชื่อใหม่ "หลัง login ครั้งถัดไป" (อ่านจาก localStorage `userdata`) — ถ้าอยากให้เปลี่ยนทันทีหลังกดบันทึก ค่อยให้ frontend ดึง profile ใหม่มา refresh `userdata` (รอ #1 พร้อมก่อน)
