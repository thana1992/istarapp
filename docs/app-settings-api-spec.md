# API Spec — "ธีมระบบ" (App Settings / System Theme)

Frontend file: `src/App.vue` (methods `fetchGlobalTheme` / `saveGlobalTheme`)
Total endpoints: 2

ธีมเป็น **ค่าตั้งระดับระบบ (global)** — หัวหน้า (`usertype = 0`) / แอดมิน (`usertype = 1`) ตั้งครั้งเดียว แล้วมีผลกับผู้ใช้ทุกคน ทุกอุปกรณ์ (ตรงกับข้อความ `themeNote`: "ธีมที่เลือกจะมีผลกับผู้ใช้ทุกคน")

> **สถานะปัจจุบัน:** Frontend พร้อมแล้วและ degrade อย่างนุ่มนวล — ถ้ายังไม่มี 2 endpoint นี้ ธีมจะทำงานแบบ per-browser (เก็บใน `localStorage['uiTheme']`) และจะกลายเป็น global อัตโนมัติทันทีที่ backend เพิ่ม endpoint โดย **ไม่ต้องแก้ frontend อีก**

ค่าที่เป็นไปได้ของ `uiTheme` (8 ค่า): `"default"` | `"mothersday"` | `"loykrathong"` | `"newyear"` | `"songkran"` | `"halloween"` | `"christmas"` | `"fathersday"` | `"muaythai"` (frontend จะ ignore ค่าอื่นที่ไม่รู้จัก)

> **`/saveAppSettings` whitelist ต้องอัปเดต** ให้รับครบทั้ง 9 ค่าด้านบน (เดิมมีแค่ `default`/`mothersday`/`loykrathong`) — ไม่งั้น backend จะ reject 6 ธีมใหม่

---

## 🗄️ ตาราง `settings` (มีอยู่แล้ว — `/saveAppSettings` ใช้อยู่)

```sql
-- key/value table ที่มีอยู่แล้ว
-- settings(setting_key, setting_value)
INSERT INTO settings (setting_key, setting_value) VALUES ('uiTheme', 'default')
  ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
```

> ไม่ต้อง migrate — ตารางมีแล้ว แค่ค่า `setting_value` ของ row `setting_key='uiTheme'` ต้องเป็นหนึ่งใน `default`/`mothersday`/`loykrathong`/`newyear`/`songkran`/`halloween`/`christmas`/`fathersday`/`muaythai`

---

## 🔐 Authentication

```http
Authorization: Bearer <JWT_TOKEN>
```

- `/getAppSettings` — ต้องล็อกอิน (ผู้ใช้ทุก role อ่านได้ เพราะทุกคนต้องเห็นธีมเดียวกัน)
- `/saveAppSettings` — ต้องล็อกอิน **และ** backend ต้องเช็คจาก JWT ว่า `usertype ∈ {0, 1}` เท่านั้น (อย่าเชื่อ frontend อย่างเดียว — UI ซ่อนปุ่มให้ role อื่นแล้ว แต่ backend ต้องบังคับซ้ำ)

ทุก endpoint return **HTTP 200** เสมอ (พร้อม `success: false` ใน body เมื่อ error) — ตามแนวเดียวกับ [edit-profile-api-spec.md](edit-profile-api-spec.md)

---

## 1️⃣ `POST /getAppSettings` — อ่านธีมปัจจุบันของระบบ

เรียกตอนเปิดแอป (mount) และหลังล็อกอิน เพื่อ sync ธีมที่หัวหน้าตั้งไว้

### Request

```json
{}
```

### Response — สำเร็จ

```json
{
  "success": true,
  "settings": {
    "uiTheme": "loykrathong"
  }
}
```

> frontend รองรับทั้ง `res.data.settings.uiTheme` และ `res.data.uiTheme` (แบบแบนก็ได้)

### Response — ยังไม่เคยตั้งค่า

ส่ง `"default"` กลับมา (หรือ `success: false` ก็ได้ — frontend จะ fallback เป็น `default`/ค่าที่ cache ไว้)

### มีอยู่แล้ว — ปรับเล็กน้อย (optional)

endpoint ปัจจุบัน (ไม่มี `verifyToken` = public → ดี, หน้า login ดึงธีมมาโชว์ได้ก่อนล็อกอิน) คืน `{ success, uiTheme }` แบบแบน — frontend (`fetchGlobalTheme`) รองรับทั้ง flat (`res.data.uiTheme`) และ nested (`res.data.settings.uiTheme`) อยู่แล้ว

```js
app.post('/getAppSettings', async (req, res) => {
  try {
    const results = await queryPromise("SELECT setting_value FROM settings WHERE setting_key = 'uiTheme'");
    const uiTheme = results.length > 0 ? results[0].setting_value : 'default'; // เดิม 'neumorphic' → เปลี่ยนเป็น 'default'
    return res.json({ success: true, uiTheme });
  } catch (error) {
    console.error('Error in getAppSettings', error.stack);
    return res.status(500).send(error);
  }
});
```

> เปลี่ยน default `'neumorphic'` → `'default'` เท่านั้น (frontend จะ ignore ค่าที่ไม่รู้จักอยู่แล้ว ถ้าไม่แก้ก็ไม่พัง แค่ fallback เป็น default)

---

## 2️⃣ `POST /saveAppSettings` — หัวหน้า/แอดมินตั้งธีมระบบ (มีอยู่แล้ว — ปรับ 2 จุด)

เรียกเมื่อหัวหน้า/แอดมินเลือกธีมจากปุ่ม 🎨 บน topbar

### Request

```json
{
  "uiTheme": "loykrathong"
}
```

### ปรับ endpoint เดิม 2 จุด

```js
app.post('/saveAppSettings', verifyToken, async (req, res) => {
  // จุดที่ 2: อนุญาตหัวหน้า (usertype 0) เปลี่ยนได้ด้วย ไม่ใช่แค่ adminflag
  if (req.user.adminflag !== 1 && req.user.usertype !== 0) {
    return res.status(403).json({ success: false, message: 'Permission denied' });
  }
  const { uiTheme } = req.body;
  // จุดที่ 1: whitelist เป็นธีมชุดใหม่
  if (!['default', 'mothersday', 'loykrathong'].includes(uiTheme)) {
    return res.status(400).json({ success: false, message: 'Invalid uiTheme value' });
  }
  try {
    await queryPromise(
      "INSERT INTO settings (setting_key, setting_value) VALUES ('uiTheme', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      [uiTheme]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('Error in saveAppSettings', error.stack);
    return res.status(500).send(error);
  }
});
```

> Response `{ success: true }` พอแล้ว — frontend (`saveGlobalTheme`) ไม่ได้อ่าน body

---

## 📋 Summary — Endpoint Checklist

| # | Endpoint | Method | Body | Auth | Purpose |
|---|----------|--------|------|------|---------|
| 1 | `/getAppSettings` | POST | `{}` | logged-in (ทุก role) | อ่านธีมระบบมา apply ให้ทุกคน |
| 2 | `/saveAppSettings` | POST | `{ uiTheme }` | head/admin (usertype 0,1) | ตั้งธีมระบบ |

หมายเหตุ: ถ้าต้องการเปลี่ยนชื่อ endpoint หรือรูปแบบ response แจ้งได้ — แก้ที่ `fetchGlobalTheme` / `saveGlobalTheme` ใน `src/App.vue` จุดเดียว
