# สรุปปัญหา Layout Shift

## ปัญหา
เมื่อ toggle Christmas theme → element ขยับไปด้านขวา 15px (ขนาด scrollbar)

## สาเหตุ
Background gradient ทำให้ content สูงขึ้น → scrollbar ปรากฏ → viewport width ลดลง → layout shift!

## ทางออก (แบบเดียวที่แน่นอน)
**ให้ content สูงกว่า viewport เสมอ เพื่อให้ scrollbar แสดงตลอด**

อย่าใช้ CSS tricks ที่ซับซ้อน - ให้ธรรมชาติจัดการเอง!
