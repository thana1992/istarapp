# Family backend changes — 3 อย่าง (วางลง `server.js` ได้เลย)

ให้ "ผู้ปกครอง" แก้ไขข้อมูล + รูป สมาชิกครอบครัวของตัวเองได้อย่างปลอดภัย. Frontend พร้อมแล้ว
(`FamilyList.vue` → ปุ่มแก้ไข → IdModal → `POST /updateStudentByFamily`; อัปรูปรวมในปุ่มบันทึกเดียวกัน).

> ⚠️ **token ไม่มี `familyid`** — `/login` เซ็นแค่ `jwt.sign({ username, adminflag }, ...)`.
> ดังนั้น **ห้าม** เชื่อ `req.user.familyid` หรือ `familyid` จาก body. ต้อง lookup จาก `tuser` ด้วย `req.user.username` เสมอ.

---

## 1) `POST /updateStudentByFamily` (endpoint ใหม่)

วางต่อจาก `/updateStudentByAdmin` ได้เลย:

```js
app.post('/updateStudentByFamily', verifyToken, async (req, res) => {
  try {
    const { studentid, firstname, middlename, lastname, nickname, gender, dateofbirth, school } = req.body;
    if (!studentid) {
      return res.json({ success: false, message: 'studentid is required' });
    }

    // 1) หา familyid ของ "ผู้เรียก" จาก token.username (token ไม่มี familyid)
    const userRows = await queryPromise('SELECT familyid FROM tuser WHERE username = ?', [req.user.username]);
    const myFamilyId = userRows[0] && userRows[0].familyid;
    if (!myFamilyId) {
      return res.status(403).json({ success: false, message: 'ไม่พบครอบครัวของผู้ใช้' });
    }

    // 2) หาว่าสมาชิกอยู่ตารางไหน (tstudent=อนุมัติแล้ว / jstudent=รออนุมัติ) + เช็คว่าเป็นของครอบครัวนี้จริง (กัน IDOR)
    let table = null;
    const inMain = await queryPromise('SELECT familyid FROM tstudent WHERE studentid = ? AND delflag = 0', [studentid]);
    if (inMain.length) {
      table = 'tstudent';
      if (String(inMain[0].familyid) !== String(myFamilyId)) {
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์แก้ไขสมาชิกคนนี้' });
      }
    } else {
      const inPending = await queryPromise('SELECT familyid FROM jstudent WHERE studentid = ?', [studentid]);
      if (inPending.length) {
        table = 'jstudent';
        if (String(inPending[0].familyid) !== String(myFamilyId)) {
          return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์แก้ไขสมาชิกคนนี้' });
        }
      }
    }
    if (!table) {
      return res.json({ success: false, message: 'ไม่พบสมาชิก' });
    }

    // 3) อัปเดตเฉพาะฟิลด์โปรไฟล์ที่ปลอดภัย — ไม่แตะ level / familyid / courserefer
    //    (jstudent ไม่มีคอลัมน์ updateby จึงใส่เฉพาะตอน tstudent)
    const updateby = table === 'tstudent' ? ', updateby = ?' : '';
    const sql =
      `UPDATE ${table}
          SET firstname = ?, middlename = ?, lastname = ?, nickname = ?, gender = ?, dateofbirth = ?, school = ?${updateby}
        WHERE studentid = ? AND familyid = ?`;
    const params = table === 'tstudent'
      ? [firstname, middlename, lastname, nickname, gender, dateofbirth, school, req.user.username, studentid, myFamilyId]
      : [firstname, middlename, lastname, nickname, gender, dateofbirth, school, studentid, myFamilyId];

    await queryPromise(sql, params);
    logStudentToDiscord('info', `✅ [updateStudentByFamily][${req.user.username}]`,
      `Updated ${table} : ${studentid}\nBody : ${JSON.stringify(req.body)}`);
    // row ผ่านการเช็คเจ้าของ+มีอยู่จริงแล้ว → ถือว่าสำเร็จ (affectedRows อาจ=0 ถ้าไม่มีค่าเปลี่ยน)
    return res.json({ success: true, message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (error) {
    logStudentToDiscord('error', `❌ [updateStudentByFamily][${req.user.username}]`,
      `Body : ${JSON.stringify(req.body)}\n❌ ${error.message}`);
    console.error('Error in updateStudentByFamily', error.stack);
    return res.status(500).send(error);
  }
});
```

**Request ที่ frontend ส่ง:** `{ studentid, familyid, firstname, middlename, lastname, nickname, gender, dateofbirth:'YYYY-MM-DD', school }`
(backend **ละ** `familyid` จาก body ทิ้ง แล้วใช้ของจริงจาก `tuser` แทน).

---

## 2) เพิ่ม `profile_image_url` (และฟิลด์การ์ด) ใน `getFamilyList`

แทนที่ query เดิมใน `app.post('/getFamilyList', ...)`:

```js
const query =
  ' select a.studentid, a.familyid, a.firstname, a.middlename, a.lastname, a.nickname, a.gender, a.dateofbirth, ' +
  '   a.profile_image_url, a.school, a.level, t.coursename, t.course_shortname, ' +   // ★ เพิ่ม
  '   CONCAT(IFNULL(a.firstname,\'\'), \' \', IFNULL(a.middlename,\'\'), IF(a.middlename<>\'\', \' \', \'\'), IFNULL(a.lastname,\'\'), \' (\', a.nickname,\')\') fullname, \'0\' journal ' +
  ' from tstudent a ' +
  ' left join tcustomer_course b on a.courserefer = b.courserefer and b.finish = 0 ' +  // ★ คอร์สปัจจุบัน
  ' left join tcourseinfo t on b.courseid = t.courseid ' +                              // ★
  ' where a.familyid = ? and a.delflag = 0 ' +
  ' UNION ALL ' +
  ' select a.studentid, a.familyid, a.firstname, a.middlename, a.lastname, a.nickname, a.gender, a.dateofbirth, ' +
  '   NULL as profile_image_url, a.school, NULL as level, NULL as coursename, NULL as course_shortname, ' +  // ★ jstudent ไม่มีคอลัมน์เหล่านี้ → NULL ให้ครบจำนวนคอลัมน์
  '   CONCAT(IFNULL(a.firstname,\'\'), \' \', IFNULL(a.middlename,\'\'), IF(a.middlename<>\'\', \' \', \'\'), IFNULL(a.lastname,\'\'), \' (\', a.nickname,\')\') fullname, \'1\' journal ' +
  ' from jstudent a ' +
  ' where a.familyid = ? ';
```

> - ขั้นต่ำที่ต้องมีคือ **`a.profile_image_url`** (ทำให้รูปการ์ดโชว์หลังรีเฟรช).
> - ฟิลด์ `school` / `level` / `coursename` / `course_shortname` ใส่เพิ่มเพื่อให้การ์ด (เพศ·อายุ·Level + คอร์ส + โรงเรียน) และฟอร์ม prefill ครบ. การ์ดฝั่ง frontend ใช้ `v-if` อยู่แล้ว → ใส่/ไม่ใส่ก็ไม่พัง.
> - ใน UNION **จำนวนคอลัมน์ + ลำดับ ต้องตรงกัน** ทั้ง 2 ฝั่ง (jstudent ที่ไม่มีคอลัมน์ → ใส่ `NULL as ...`).
> - ถ้า `jstudent` "มี" คอลัมน์ `school` จริง ก็ใช้ `a.school` ได้; ถ้าไม่มีให้เปลี่ยนเป็น `NULL as school`.

---

## 3) Ownership guard ของ `/uploadProfileImage`

ปัจจุบัน `/uploadProfileImage` มีแค่ `verifyToken` แล้ว `UPDATE tstudent SET profile_image_url WHERE studentid` ตรง ๆ → ลูกค้ายิง studentid เด็กครอบครัวอื่นมาได้ (IDOR). เพิ่ม guard ที่**ต้นฟังก์ชัน** (ก่อนอัป S3 จะได้ไม่เปลือง):

```js
app.post('/uploadProfileImage', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    // ---- เพิ่ม: ตรวจไฟล์ + สิทธิ์ก่อน ----
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const studentId = req.body.studentid;
    // staff (adminflag=1: head/admin/coach) แก้รูปใครก็ได้; "ลูกค้า" แก้ได้เฉพาะสมาชิกในครอบครัวตัวเอง
    if (req.user.adminflag != 1) {
      const fam = await queryPromise('SELECT familyid FROM tuser WHERE username = ?', [req.user.username]);
      const myFamilyId = fam[0] && fam[0].familyid;
      const stu = await queryPromise(
        'SELECT familyid FROM tstudent WHERE studentid = ? UNION SELECT familyid FROM jstudent WHERE studentid = ?',
        [studentId, studentId]
      );
      if (!myFamilyId || !stu.length || String(stu[0].familyid) !== String(myFamilyId)) {
        fs.unlink(req.file.path, () => {});   // ลบไฟล์ temp ที่ multer เก็บไว้
        return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์อัปโหลดรูปของสมาชิกคนนี้' });
      }
    }
    // ---- (โค้ดเดิมต่อจากนี้: createReadStream / S3 upload / UPDATE tstudent ... เหมือนเดิม) ----
    const fileStream = fs.createReadStream(req.file.path);
    // ... (ไม่ต้องแก้ส่วนล่าง)
```

> - ใช้ `req.user.adminflag != 1` แยก staff/ลูกค้า (เหมือน `/getClassTime` ที่เช็ค `req.user.adminflag != '1'`).
> - หมายเหตุ: `/uploadProfileImage` `UPDATE tstudent` เท่านั้น → สมาชิก "รออนุมัติ" (jstudent) ที่ยังไม่มีในtstudent รูปจะไม่ถูกบันทึก (affectedRows=0). ถ้าต้องรองรับรูปของ pending member ด้วย ค่อยเพิ่ม UPDATE jstudent (ถ้ามีคอลัมน์ profile_image_url).

---

## สรุปตารางที่เกี่ยวข้อง
- `tuser(username, familyid, ...)` — แหล่ง familyid ที่เชื่อถือได้ของผู้เรียก (จาก token.username).
- `tstudent(studentid, familyid, firstname.., school, level, courserefer, profile_image_url, delflag, updateby ...)` — สมาชิกที่อนุมัติแล้ว.
- `jstudent(studentid, familyid, firstname.., gender, dateofbirth, school ...)` — สมาชิกรออนุมัติ (จาก `/addStudent`); ไม่มี updateby/level/courserefer/profile_image_url.
