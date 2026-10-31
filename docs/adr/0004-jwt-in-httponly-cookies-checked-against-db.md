# เก็บ JWT ใน httpOnly cookie และตรวจกับฐานข้อมูลทุก request

เลือก JWT ตามความต้องการของเจ้าของโปรเจกต์ และถือความปลอดภัยเป็นหลัก จึงเก็บ access และ refresh token ใน httpOnly cookie เพื่อให้สคริปต์อ่าน token ไม่ได้ พร้อมตรวจ `sid`, สิทธิ์ และสถานะร้านจาก DB ทุก request เพื่อให้การระงับร้านหรือเพิกถอนสิทธิ์มีผลทันที ระบบจึงไม่ได้ใช้ข้อดีเรื่อง stateless ของ JWT ซึ่งเป็นการตัดสินใจโดยรู้ข้อแลกเปลี่ยนนี้

## Considered Options

- **Access token ใน memory และส่งผ่าน `Authorization`:** ลดพื้นผิว CSRF ของ API หลัก แต่ XSS อ่าน token ไปใช้นอก browser ได้ระหว่างที่ token ยังไม่หมดอายุ
- **Session แบบ opaque ใน cookie:** เรียบง่ายกว่าและไม่มีความเสี่ยงที่ signing key รั่ว ในเชิงความปลอดภัยดีกว่าเล็กน้อย การตรวจ `sid` กับ DB ช่วยลดส่วนต่างนี้

## Consequences

- เพราะ cookie ถูกแนบอัตโนมัติ ทุก request ที่แก้ข้อมูลต้องผ่าน `SameSite=Strict`, การตรวจ `Origin` และ CSRF token
- XSS ยังสั่งงานแทนผู้ใช้ได้ขณะหน้าเปิดอยู่ จึงต้องใช้ CSP แบบเข้มงวด
- JWT ของ Platform Admin ใช้ `aud` แยกจากของร้าน
- ไม่มี MFA ใน MVP
